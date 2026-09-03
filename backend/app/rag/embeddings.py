import numpy as np
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer

class LightweightEmbedder:
    """Fast, zero-latency local vector embedder using TF-IDF feature space."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.is_fitted = False

    def fit_transform(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.array([])
        matrix = self.vectorizer.fit_transform(texts)
        self.is_fitted = True
        return matrix.toarray()

    def transform(self, texts: List[str]) -> np.ndarray:
        if not self.is_fitted or not texts:
            # Fallback random normalized vectors if transform before fit
            return np.zeros((len(texts), 128))
        try:
            return self.vectorizer.transform(texts).toarray()
        except Exception:
            return np.zeros((len(texts), self.vectorizer.vocabulary_.__len__()))

embedder = LightweightEmbedder()
