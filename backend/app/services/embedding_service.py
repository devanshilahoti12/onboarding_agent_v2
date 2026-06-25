import re
from sentence_transformers import SentenceTransformer

# Downloads ~80 MB on first use, cached locally after that.
# Produces 384-dim embeddings — works great with ChromaDB cosine similarity.
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def chunk_text(text: str, max_words: int = 200, overlap_words: int = 30) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap_words
    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings.tolist()


def embed_single(text: str) -> list[float]:
    result = embed_texts([text])
    return result[0] if result else []
