from fastapi import APIRouter, HTTPException
import logging

from models.schemas import ChatRequest, ChatResponse
from database.chroma_client import search_diary, get_or_create_collection
from utils.embeddings import generate_embedding
from utils.ollama_client import chat_with_context, check_ollama
from database.chroma_client import DIARY_COLLECTION, PHILOSOPHY_COLLECTION as PHIL_COL

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Check Ollama
    ollama_available = await check_ollama()
    if not ollama_available:
        # Fallback: search-only response
        return await search_only_response(request)

    # Generate query embedding
    query_emb = generate_embedding(request.query)

    # Search diary
    diary_results = search_diary(query_emb, n_results=request.n_results)
    diary_chunks = []
    if diary_results and diary_results.get("documents"):
        for i, doc_list in enumerate(diary_results["documents"]):
            for j, doc in enumerate(doc_list):
                meta = {}
                if diary_results.get("metadatas") and len(diary_results["metadatas"]) > i:
                    ml = diary_results["metadatas"][i]
                    if j < len(ml):
                        meta = ml[j] or {}
                diary_chunks.append({
                    "document": doc,
                    "metadata": meta,
                    "distance": diary_results["distances"][i][j] if diary_results.get("distances") else 0
                })

    # Search philosophy
    philosophy_chunks = []
    if request.include_philosophy:
        try:
            phil_col = get_or_create_collection(PHIL_COL)
            phil_results = phil_col.query(
                query_embeddings=[query_emb],
                n_results=3
            )
            if phil_results and phil_results.get("documents"):
                for i, doc_list in enumerate(phil_results["documents"]):
                    for j, doc in enumerate(doc_list):
                        meta = {}
                        if phil_results.get("metadatas") and len(phil_results["metadatas"]) > i:
                            ml = phil_results["metadatas"][i]
                            if j < len(ml):
                                meta = ml[j] or {}
                        philosophy_chunks.append({
                            "document": doc,
                            "metadata": meta
                        })
        except Exception as e:
            logger.warning(f"Philosophy search failed: {e}")

    # Get AI answer
    answer = await chat_with_context(
        query=request.query,
        context_chunks=diary_chunks,
        philosophy_chunks=philosophy_chunks if philosophy_chunks else None
    )

    # Build sources
    sources = []
    for c in diary_chunks[:5]:
        sources.append({
            "text": c["document"][:200],
            "filename": c["metadata"].get("filename", "unknown"),
            "emotions": c["metadata"].get("emotions", ""),
            "themes": c["metadata"].get("themes", ""),
            "relevance": round(1 - c.get("distance", 0), 3) if c.get("distance") else 0
        })

    return ChatResponse(
        answer=answer,
        sources=sources,
        model_used="Qwen 2.5 (local via Ollama)"
    )


async def search_only_response(request: ChatRequest) -> ChatResponse:
    """Fallback when Ollama is not available: return search results directly."""
    query_emb = generate_embedding(request.query)
    diary_results = search_diary(query_emb, n_results=request.n_results)

    if not diary_results or not diary_results.get("documents"):
        return ChatResponse(
            answer="No diary entries found matching your query. Upload some diary pages first!",
            sources=[],
            model_used="Search Only (Ollama offline)"
        )

    entries_text = []
    for doc_list in diary_results["documents"]:
        for doc in doc_list:
            entries_text.append(f"• {doc[:300]}")

    answer = (
        f"Found {len(entries_text)} relevant diary entries for your question. "
        f"However, the AI model (Ollama) needs to be running for me to analyze them properly.\n\n"
        f"To enable AI analysis, run: ollama run qwen2.5:7b\n\n"
        f"Relevant entries:\n" + "\n".join(entries_text[:5])
    )

    return ChatResponse(
        answer=answer,
        sources=[{"text": t[2:]} for t in entries_text[:5]],
        model_used="Search Only (Ollama offline)"
    )