import re
import uuid
import logging
from typing import Any, Dict, List, Optional
from app.ai.llm_provider import llm_client
from app.ai.prompts import SYSTEM_UNDERSTANDING_PROMPT, UNDERSTANDING_PROMPT_TEMPLATE
from app.ai.learner_context import (
    LearnerProfileNormalized,
    KnowledgeSource,
    TopicUnderstanding,
    TeachingConstraints,
    RetrievedChunk,
    LearningContext,
)
from app.rag.rag_service import rag_service
from app.schemas.schemas import LearnerProfileSchema

logger = logging.getLogger(__name__)


class TopicAnalyzer:
    """
    AI Understanding Engine for Workflow 2.

    Responsibilities:
      - Normalize the learner profile
      - Retrieve relevant document chunks (PATH B) or identify topic scope (PATH A)
      - Call the LLM to produce a structured TopicUnderstanding
      - Return a fully validated LearningContext

    This service does NOT generate lesson content.
    """

    def _parse_time_minutes(self, time_str: str) -> int:
        match = re.search(r"(\d+)", str(time_str))
        return int(match.group(1)) if match else 30

    def _normalize_profile(self, profile: LearnerProfileSchema) -> LearnerProfileNormalized:
        return LearnerProfileNormalized(
            education_level=profile.education_level or "Intermediate",
            learning_goal=profile.learning_goal or "Foundational understanding",
            language=profile.preferred_language or "English",
            teaching_style=profile.teaching_style or "Socratic",
            available_time_minutes=self._parse_time_minutes(profile.available_time),
            desired_depth=profile.desired_depth or "Balanced",
            prior_knowledge_summary=profile.current_knowledge or None,
        )

    async def understand(
        self,
        topic: str,
        profile: LearnerProfileSchema,
        document_id: Optional[str] = None,
    ) -> LearningContext:
        """
        Main entry point for Workflow 2.

        PATH A: topic only -> general topic knowledge
        PATH B: document uploaded -> RAG retrieval -> grounded context
        """
        session_id = f"session_{uuid.uuid4().hex[:12]}"

        # Step 1: Normalize learner profile
        normalized_profile = self._normalize_profile(profile)
        logger.info(f"[W2] Session {session_id}: profile normalized for topic='{topic}'")

        # Step 2: Determine knowledge source and retrieve chunks
        retrieved_chunks: List[RetrievedChunk] = []
        knowledge_source: KnowledgeSource

        if document_id:
            # PATH B: Document-grounded learning
            raw_chunks = rag_service.get_relevant_chunks(topic, top_k=5)
            retrieved_chunks = [
                RetrievedChunk(
                    chunk_id=c.get("id", f"chunk_{i}"),
                    text=c.get("text", ""),
                    source=c.get("document", "Uploaded Document"),
                    page=c.get("page", 1),
                    section=c.get("section", ""),
                    relevance_score=float(c.get("score", 0.0)),
                    citation=c.get("citation", f"Source: {c.get('document', 'Document')}, Page {c.get('page', 1)}")
                )
                for i, c in enumerate(raw_chunks)
                if c.get("text", "").strip()
            ]
            knowledge_source = KnowledgeSource(
                type="uploaded_material",
                documents=[{"id": document_id}],
                grounding_available=bool(retrieved_chunks),
            )
            logger.info(f"[W2] Session {session_id}: retrieved {len(retrieved_chunks)} chunks from document.")
        else:
            # PATH A: Topic-only learning
            knowledge_source = KnowledgeSource(
                type="topic",
                documents=[],
                grounding_available=False,
            )
            logger.info(f"[W2] Session {session_id}: topic-only mode, no document.")

        # Step 3: Build document context string for prompt
        if retrieved_chunks:
            doc_context_parts = ["=== RETRIEVED DOCUMENT CONTENT ==="]
            for chunk in retrieved_chunks[:4]:
                doc_context_parts.append(
                    f"\n[{chunk.citation}]\n{chunk.text[:600]}{'...' if len(chunk.text) > 600 else ''}"
                )
            doc_context_str = "\n".join(doc_context_parts)
        else:
            doc_context_str = "No document uploaded. Use general knowledge for this topic."

        source_type = "uploaded_material" if document_id else "general_knowledge"

        # Step 4: Call LLM to produce TopicUnderstanding
        prompt = UNDERSTANDING_PROMPT_TEMPLATE.format(
            topic=topic,
            education_level=normalized_profile.education_level,
            learning_goal=normalized_profile.learning_goal,
            language=normalized_profile.language,
            teaching_style=normalized_profile.teaching_style,
            time_minutes=normalized_profile.available_time_minutes,
            desired_depth=normalized_profile.desired_depth,
            prior_knowledge=normalized_profile.prior_knowledge_summary or "Not specified",
            source_type=source_type,
            document_context=doc_context_str,
        )

        try:
            llm_result = await llm_client.generate_json(prompt, SYSTEM_UNDERSTANDING_PROMPT)
            topic_understanding = self._parse_topic_understanding(llm_result, topic, source_type)
        except Exception as e:
            logger.warning(f"[W2] LLM understanding failed: {e}. Using deterministic fallback.")
            topic_understanding = self._build_fallback_understanding(topic, normalized_profile, source_type)

        # Step 5: Assemble LearningContext
        teaching_constraints = TeachingConstraints(
            language=normalized_profile.language,
            style=normalized_profile.teaching_style,
            time_minutes=normalized_profile.available_time_minutes,
            depth=normalized_profile.desired_depth,
        )

        context = LearningContext(
            session_id=session_id,
            topic=topic,
            learner_profile=normalized_profile,
            knowledge_source=knowledge_source,
            topic_understanding=topic_understanding,
            retrieved_context=retrieved_chunks,
            teaching_constraints=teaching_constraints,
            formatted_rag_context="",
        )
        context.formatted_rag_context = context.to_rag_context_string()

        logger.info(f"[W2] Session {session_id}: LearningContext built successfully.")
        return context

    def _parse_topic_understanding(
        self, llm_result: Dict[str, Any], topic: str, source_type: str
    ) -> TopicUnderstanding:
        """Parse and validate the LLM's JSON output into a TopicUnderstanding model."""
        tu = llm_result.get("topic_understanding")
        if not tu or not isinstance(tu, dict):
            if "core_concepts" in llm_result or "summary" in llm_result:
                tu = llm_result
            else:
                return self._build_minimal_understanding(topic, source_type)

        def ensure_list(val) -> List[str]:
            if isinstance(val, list):
                return [str(x) for x in val if x]
            if isinstance(val, str) and val:
                return [val]
            return []

        return TopicUnderstanding(
            summary=str(tu.get("summary", f"A structured study of {topic}.")).strip() or f"A structured study of {topic}.",
            core_concepts=ensure_list(tu.get("core_concepts", [])),
            prerequisites=ensure_list(tu.get("prerequisites", [])),
            important_relationships=ensure_list(tu.get("important_relationships", [])),
            likely_learning_scope=ensure_list(tu.get("likely_learning_scope", [])),
            source_type=source_type,
        )

    def _build_fallback_understanding(
        self, topic: str, profile: LearnerProfileNormalized, source_type: str
    ) -> TopicUnderstanding:
        """Deterministic fallback understanding when LLM is unavailable."""
        depth_scope_count = {"High-level overview": 3, "Balanced": 4, "Deep dive": 6, "Mastery": 8}.get(profile.desired_depth, 4)
        return TopicUnderstanding(
            summary=(
                f"{topic} is a subject studied at the {profile.education_level} level. "
                f"This session targets {profile.learning_goal} within {profile.available_time_minutes} minutes "
                f"using a {profile.teaching_style} teaching approach."
            ),
            core_concepts=[
                f"Core Definitions and Terminology in {topic}",
                f"Fundamental Principles of {topic}",
                f"Key Variables and Their Relationships in {topic}",
                f"Practical Applications of {topic}",
                f"Mathematical or Logical Framework of {topic}",
                f"Common Misconceptions in {topic}",
            ][:depth_scope_count],
            prerequisites=[
                f"Basic {profile.education_level}-level foundations",
                "Analytical and reasoning skills",
            ],
            important_relationships=[
                f"Cause-and-effect dynamics in {topic}",
                f"Proportional and inverse relationships in {topic}",
            ],
            likely_learning_scope=[
                f"Introduction to {topic}",
                f"Core Principles of {topic}",
                f"Applied Problems in {topic}",
                f"Real-world Connections in {topic}",
            ][:depth_scope_count],
            source_type=source_type,
        )

    def _build_minimal_understanding(self, topic: str, source_type: str) -> TopicUnderstanding:
        """Minimal fallback if LLM response is structurally empty."""
        return TopicUnderstanding(
            summary=f"A structured exploration of {topic} tailored to the learner's profile.",
            core_concepts=[f"Foundations of {topic}", f"Key Principles of {topic}", f"Applications of {topic}"],
            prerequisites=[],
            important_relationships=[],
            likely_learning_scope=[f"Introduction to {topic}", f"Core Concepts of {topic}"],
            source_type=source_type,
        )


topic_analyzer = TopicAnalyzer()
