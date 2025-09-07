import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

# Create test database
SQLITE_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_thread():
    thread_data = {
        "title": "Test Thread",
        "content": "This is a test thread content"
    }
    response = client.post("/api/threads", json=thread_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == thread_data["title"]
    assert data["content"] == thread_data["content"]
    assert "id" in data
    assert "created_at" in data


def test_get_threads():
    # Create a thread first
    thread_data = {
        "title": "Test Thread",
        "content": "This is a test thread content"
    }
    client.post("/api/threads", json=thread_data)
    
    # Get all threads
    response = client.get("/api/threads")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_thread_by_id():
    # Create a thread first
    thread_data = {
        "title": "Test Thread",
        "content": "This is a test thread content"
    }
    create_response = client.post("/api/threads", json=thread_data)
    thread_id = create_response.json()["id"]
    
    # Get the thread by ID
    response = client.get(f"/api/threads/{thread_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == thread_id
    assert data["title"] == thread_data["title"]


def test_get_nonexistent_thread():
    response = client.get("/api/threads/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Thread not found"


def test_create_post():
    # Create a thread first
    thread_data = {
        "title": "Test Thread",
        "content": "This is a test thread content"
    }
    thread_response = client.post("/api/threads", json=thread_data)
    thread_id = thread_response.json()["id"]
    
    # Create a post
    post_data = {
        "content": "This is a test post"
    }
    response = client.post(f"/api/threads/{thread_id}/posts", json=post_data)
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == post_data["content"]
    assert data["thread_id"] == thread_id
    assert "id" in data
    assert "created_at" in data


def test_create_post_nonexistent_thread():
    post_data = {
        "content": "This is a test post"
    }
    response = client.post("/api/threads/999/posts", json=post_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Thread not found"


def test_get_posts():
    # Create a thread first
    thread_data = {
        "title": "Test Thread",
        "content": "This is a test thread content"
    }
    thread_response = client.post("/api/threads", json=thread_data)
    thread_id = thread_response.json()["id"]
    
    # Create a post
    post_data = {
        "content": "This is a test post"
    }
    client.post(f"/api/threads/{thread_id}/posts", json=post_data)
    
    # Get posts
    response = client.get(f"/api/threads/{thread_id}/posts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["content"] == post_data["content"]


def test_get_posts_nonexistent_thread():
    response = client.get("/api/threads/999/posts")
    assert response.status_code == 404
    assert response.json()["detail"] == "Thread not found"
