import chromadb
from chromadb import Collection
from ..config import settings

_client: chromadb.PersistentClient | None = None


def get_chroma_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
    return _client


def get_or_create_collection(kb_identifier: str) -> Collection:
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=kb_identifier,
        metadata={"hnsw:space": "cosine"},
    )


def add_documents(
    kb_identifier: str,
    ids: list[str],
    embeddings: list[list[float]],
    documents: list[str],
    metadatas: list[dict],
) -> None:
    col = get_or_create_collection(kb_identifier)
    col.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)


def collection_count(kb_identifier: str) -> int:
    try:
        col = get_chroma_client().get_collection(kb_identifier)
        return col.count()
    except Exception:
        return 0


def delete_collection(kb_identifier: str) -> None:
    try:
        get_chroma_client().delete_collection(kb_identifier)
    except Exception:
        pass
