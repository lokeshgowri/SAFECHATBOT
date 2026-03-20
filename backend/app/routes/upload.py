import os
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.ai.rag_engine import index_document

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def background_index(file_path: str):
    try:
        index_document(file_path)
    except Exception as e:
        import traceback
        traceback.print_exc()

@router.post("/")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".txt", ".docx", ".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Please upload a PDF, TXT, DOCX, JPG, or PNG."
        )

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    background_tasks.add_task(background_index, file_path)

    return {"message": "Document uploaded and indexing in the background!"}