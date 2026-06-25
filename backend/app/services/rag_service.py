from openai import AzureOpenAI

from ..config import settings
from .chroma_service import get_chroma_client
from .embedding_service import embed_single

_chat_client: AzureOpenAI | None = None


def get_chat_client() -> AzureOpenAI:
    global _chat_client
    if _chat_client is None:
        _chat_client = AzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
    return _chat_client


def retrieve_context(kb_identifier: str, query: str, top_k: int = 10) -> list[dict]:
    """Embed query, search ChromaDB, return top-k chunks with metadata."""
    query_vector = embed_single(query)
    if not query_vector:
        return []

    try:
        col = get_chroma_client().get_collection(kb_identifier)
    except Exception:
        return []

    results = col.query(
        query_embeddings=[query_vector],
        n_results=min(top_k, col.count()),
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        if dist < 1.5:  # cosine distance threshold — drop irrelevant results
            chunks.append({"text": doc, "url": meta.get("url", ""), "title": meta.get("title", "")})
    return chunks


def build_context_block(chunks: list[dict]) -> str:
    parts = []
    for c in chunks:
        parts.append(f"Source: {c['url']}\n{c['text']}")
    return "\n---\n".join(parts)


def answer(
    message: str,
    kb_identifier: str,
    website_url: str,
    conversation_history: list[dict],
) -> tuple[str, list[dict]]:
    """Full RAG pipeline. Returns (reply_text, sources_list)."""
    chunks = retrieve_context(kb_identifier, message)

    if not chunks:
        return (
            "That question is outside my knowledge scope. I can only answer questions related to this website.",
            [],
        )

    context = build_context_block(chunks)

    system_prompt = (
        f"You are a helpful AI assistant for the website {website_url}. "
        "Answer questions using ONLY the context provided below. "
        "If the answer is not in the context, respond with: 'That question is outside my knowledge scope. I can only answer questions related to this website's content.' Do not guess or make up information. "
        "Be concise, friendly, and accurate."
        f"\n\nContext:\n{context}"
    )

    messages = [{"role": "system", "content": system_prompt}]

    # Include last 3 conversation turns for context
    for turn in conversation_history[-6:]:
        messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": message})

    client = get_chat_client()
    response = client.chat.completions.create(
        model=settings.AZURE_OPENAI_CHAT_DEPLOYMENT,
        messages=messages,
        temperature=0.3,
        max_tokens=512,
    )

    reply = response.choices[0].message.content.strip()

    # Deduplicate sources
    seen = set()
    sources = []
    for c in chunks:
        if c["url"] not in seen:
            seen.add(c["url"])
            sources.append({"url": c["url"], "title": c["title"]})

    return reply, sources
