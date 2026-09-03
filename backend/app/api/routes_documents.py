import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.schemas import DocumentUploadResponse
from app.rag.rag_service import rag_service
from app.config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx", ".pptx", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, PPTX, or TXT.")

    upload_dir = os.path.join(settings.DATA_DIR, "uploads")
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = rag_service.process_and_index_document(file_path, filename)
    return DocumentUploadResponse(**result)
