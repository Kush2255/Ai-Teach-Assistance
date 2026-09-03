import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api import routes_documents, routes_lessons, routes_student, routes_demo

# Initialize SQLite Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Adaptive AI Educator API powering interactive video lessons, misconception detection, RAG document learning, and personalized progress.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static audio directory for generated TTS files
audio_dir = os.path.join(settings.DATA_DIR, "audio")
os.makedirs(audio_dir, exist_ok=True)
app.mount("/static/audio", StaticFiles(directory=audio_dir), name="static_audio")

# Include API Routers
app.include_router(routes_documents.router)
app.include_router(routes_lessons.router)
app.include_router(routes_student.router)
app.include_router(routes_demo.router)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "message": "AI Teacher API backend is running smoothly!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
