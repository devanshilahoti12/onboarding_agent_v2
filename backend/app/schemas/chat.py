from pydantic import BaseModel


class ConversationTurn(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    site_identifier: str
    kb_identifier: str
    conversation_history: list[ConversationTurn] = []


class SourceRef(BaseModel):
    url: str
    title: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[SourceRef] = []
