import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import aiofiles
import logging

from models.schemas import UploadResponse, BatchUploadResponse
from pipelines.ocr_pipeline import extract_text, allowed_file
from utils.text_chunker import chunk_text, extract_metadata, detect_language
from utils.embeddings import generate_embeddings
from database.chroma_client import add_diary_entry, get_entry_count
from utils.ollama_client import extract_entities

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail=f"File type not supported: {file.filename}")

    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)

    # OCR extraction
    extracted_text = extract_text(file_path)
    if extracted_text.startswith("[OCR") or extracted_text.startswith("[PDF"):
        return UploadResponse(
            file_id=file_id,
            filename=file.filename,
            status="error",
            extracted_text=extracted_text,
            error=extracted_text
        )

    # Chunk
    chunks = chunk_text(extracted_text)
    if not chunks:
        return UploadResponse(
            file_id=file_id,
            filename=file.filename,
            status="completed",
            extracted_text=extracted_text,
            chunks_count=0
        )

    # Extract entities with AI
    entities = await extract_entities(extracted_text)
    base_meta = extract_metadata(extracted_text)
    language = detect_language(extracted_text)
    total_entries = get_entry_count()

    # Generate embeddings and store
    embeddings = generate_embeddings(chunks)
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        meta = {
            **base_meta,
            "file_id": file_id,
            "filename": file.filename,
            "chunk_index": i,
            "total_chunks": len(chunks),
            "language": language,
            "date": str(uuid.uuid1().time),  # timestamp-based
            "emotions": ",".join(entities.get("emotions", [])),
            "themes": ",".join(entities.get("themes", [])),
            "beliefs": ",".join(entities.get("beliefs", [])),
            "entry_number": total_entries + 1,
        }
        chunk_id = f"{file_id}_chunk_{i}"
        add_diary_entry(chunk_id, chunk, emb, meta)

    logger.info(f"Uploaded {file.filename}: {len(chunks)} chunks, lang={language}")

    return UploadResponse(
        file_id=file_id,
        filename=file.filename,
        status="completed",
        extracted_text=extracted_text[:2000],  # Preview
        chunks_count=len(chunks)
    )

@router.post("/batch", response_model=BatchUploadResponse)
async def upload_batch(files: List[UploadFile] = File(...)):
    results = []
    succeeded = 0
    failed = 0
    for file in files:
        try:
            result = await upload_file(file)
            results.append(result)
            if result.status == "completed":
                succeeded += 1
            else:
                failed += 1
        except Exception as e:
            results.append(UploadResponse(
                file_id="error",
                filename=file.filename,
                status="error",
                error=str(e)
            ))
            failed += 1
    return BatchUploadResponse(
        total=len(files),
        succeeded=succeeded,
        failed=failed,
        results=results
    )