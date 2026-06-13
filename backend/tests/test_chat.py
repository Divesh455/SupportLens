from fastapi.testclient import TestClient
from tests.conftest import client

def test_chat_unauthorized():
    response = client.post("/chat/", json={"message": "hello"})
    assert response.status_code == 401
