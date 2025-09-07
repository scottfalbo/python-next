from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class PostBase(BaseModel):
    content: str


class PostCreate(PostBase):
    pass


class Post(PostBase):
    id: int
    thread_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ThreadBase(BaseModel):
    title: str
    content: str


class ThreadCreate(ThreadBase):
    pass


class Thread(ThreadBase):
    id: int
    created_at: datetime
    posts: List[Post] = []

    class Config:
        from_attributes = True
