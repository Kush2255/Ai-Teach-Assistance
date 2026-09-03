import uuid
from typing import Dict, Any, List
from app.rag.document_processor import document_processor
from app.rag.chunker import chunker
from app.rag.vector_store import vector_store
from app.rag.retriever import retriever

class RAGService:
    """Facade for document parsing, chunking, indexing, and retrieval."""

    def process_and_index_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        pages = document_processor.extract_text(file_path)
        chunks = chunker.chunk_document(doc_id, filename, pages)
        vector_store.index_chunks(chunks)

        sample_text = pages[0]["text"][:200] if pages else ""
        return {
            "document_id": doc_id,
            "filename": filename,
            "total_pages": len(pages),
            "chunks_indexed": len(chunks),
            "sample_text": sample_text
        }

    def get_relevant_context(self, query: str) -> str:
        results = retriever.retrieve(query, top_k=3)
        if not results:
            return ""
        
        context_parts = []
        for r in results:
            context_parts.append(f"[{r['citation']}]\n{r['text']}")
        return "\n\n".join(context_parts)

rag_service = RAGService()
