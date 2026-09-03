import numpy as np
from typing import List, Dict, Any
from app.rag.embeddings import embedder

class VectorStore:
    """Local vector store managing indexed chunks and cosine similarity retrieval."""

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.vectors: np.ndarray = np.array([])

    def index_chunks(self, chunks: List[Dict[str, Any]]):
        if not chunks:
            return
        self.chunks.extend(chunks)
        texts = [c["text"] for c in self.chunks]
        self.vectors = embedder.fit_transform(texts)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks or self.vectors.size == 0:
            return []

        q_vec = embedder.transform([query])
        if q_vec.shape[1] != self.vectors.shape[1]:
            # Simple keyword matching fallback if dimension mismatch
            results = []
            q_lower = query.lower()
            for chunk in self.chunks:
                score = sum(1 for word in q_lower.split() if word in chunk["text"].lower())
                if score > 0:
                    chunk_copy = dict(chunk)
                    chunk_copy["score"] = float(score)
                    results.append(chunk_copy)
            results.sort(key=lambda x: x["score"], reverse=True)
            return results[:top_k]

        # Cosine similarity dot product
        scores = np.dot(self.vectors, q_vec.T).squeeze()
        if np.isscalar(scores):
            scores = np.array([scores])

        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            if idx < len(self.chunks):
                chunk_copy = dict(self.chunks[idx])
                chunk_copy["score"] = float(scores[idx])
                results.append(chunk_copy)

        return results

vector_store = VectorStore()
