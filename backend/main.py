from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import get_db, create_tables, Thread as DBThread, Post as DBPost
import schemas

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
create_tables()


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/threads", response_model=List[schemas.Thread])
def get_threads(db: Session = Depends(get_db)):
    threads = db.query(DBThread).all()
    return threads


@app.post("/api/threads", response_model=schemas.Thread)
def create_thread(thread: schemas.ThreadCreate, db: Session = Depends(get_db)):
    db_thread = DBThread(title=thread.title, content=thread.content)
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread


@app.get("/api/threads/{thread_id}", response_model=schemas.Thread)
def get_thread(thread_id: int, db: Session = Depends(get_db)):
    thread = db.query(DBThread).filter(DBThread.id == thread_id).first()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread


@app.post("/api/threads/{thread_id}/posts", response_model=schemas.Post)
def create_post(thread_id: int, post: schemas.PostCreate, db: Session = Depends(get_db)):
    # Check if thread exists
    thread = db.query(DBThread).filter(DBThread.id == thread_id).first()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    db_post = DBPost(content=post.content, thread_id=thread_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.get("/api/threads/{thread_id}/posts", response_model=List[schemas.Post])
def get_posts(thread_id: int, db: Session = Depends(get_db)):
    # Check if thread exists
    thread = db.query(DBThread).filter(DBThread.id == thread_id).first()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    posts = db.query(DBPost).filter(DBPost.thread_id == thread_id).all()
    return posts
