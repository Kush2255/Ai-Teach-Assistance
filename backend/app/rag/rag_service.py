import uuid
from typing import Dict, Any, List, Optional
from app.rag.document_processor import document_processor
from app.rag.chunker import chunker
from app.rag.vector_store import vector_store
from app.rag.retriever import retriever

class RAGService:
    """Facade for document parsing, chunking, indexing, and retrieval."""

    # In-memory document registry for MVP (doc_id -> metadata)
    _document_registry: Dict[str, Dict[str, Any]] = {}

    def process_and_index_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        pages = document_processor.extract_text(file_path)
        chunks = chunker.chunk_document(doc_id, filename, pages)
        vector_store.index_chunks(chunks)

        meta = {
            "document_id": doc_id,
            "filename": filename,
            "total_pages": len(pages),
            "chunks_indexed": len(chunks),
            "sample_text": pages[0]["text"][:200] if pages else "",
        }
        self._document_registry[doc_id] = meta
        return meta

    def get_relevant_context(self, query: str) -> str:
        """Return formatted context string for injection into lesson planner prompt."""
        results = retriever.retrieve(query, top_k=3)
        if not results:
            return ""
        context_parts = []
        for r in results:
            context_parts.append(f"[{r['citation']}]\n{r['text']}")
        return "\n\n".join(context_parts)

    def get_relevant_chunks(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Return raw chunk dicts with full metadata (source, page, section, score, citation).
        Used by Workflow 2 (topic_analyzer) to build source-grounded LearningContext.
        """
        results = retriever.retrieve(query, top_k=top_k)
        return results  # each result already has: text, document, page, section, citation, score

    def get_document_info(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve document metadata by ID."""
        return self._document_registry.get(document_id)

rag_service = RAGService()
