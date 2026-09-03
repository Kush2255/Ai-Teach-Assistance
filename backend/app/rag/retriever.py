from typing import List, Dict, Any
from app.rag.vector_store import vector_store

class RAGRetriever:
    """Retrieves context chunks with exact metadata citations (Document, Page, Section)."""

    @staticmethod
    def retrieve(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        results = vector_store.search(query, top_k=top_k)
        for r in results:
            # Format display citation string
            r["citation"] = f"Source: {r.get('document', 'Uploaded Doc')}, Page {r.get('page', 1)} ({r.get('section', 'General')})"
        return results

retriever = RAGRetriever()
