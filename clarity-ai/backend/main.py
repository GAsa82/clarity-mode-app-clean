"""
Clarity AI Backend - FastAPI Application
Diary Intelligence Platform with OCR, Vector Search, and RAG Chat
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import upload, chat, dashboard

# Load environment
load_dotenv()

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# App
app = FastAPI(
    title="Clarity AI",
    description="Personal Diary Intelligence Platform with OCR, Vector Search & RAG",
    version="1.0.0",
)

# CORS - allow frontend dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Register routers
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(dashboard.router)


# -------------------------------
# Simple test endpoint for MVP
# -------------------------------
@app.post("/api/upload-diary")
async def upload_diary(file: UploadFile = File(...)):
    """
    Simple MVP upload endpoint.
    Accepts an image file, saves it, returns success.
    (OCR + ChromaDB pipeline will be wired in next phase.)
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Validate extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".txt"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(allowed_extensions))}",
        )

    # Save file
    safe_name = f"{os.urandom(4).hex()}_{file.filename}"
    file_path = UPLOADS_DIR / safe_name
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    logger.info(f"Uploaded: {file.filename} -> {safe_name} ({len(content)} bytes)")

    return {
        "success": True,
        "filename": file.filename,
        "saved_as": safe_name,
        "size_bytes": len(content),
        "message": "File uploaded successfully. OCR processing will be added in the next phase.",
    }


# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "service": "Clarity AI"}


# Serve frontend static files in production
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
    logger.info(f"Serving frontend from {FRONTEND_DIST}")
else:
    logger.info("Frontend dist not found. Only serving API.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)