from fastapi.testclient import TestClient
from tests.conftest import client

def test_ticket_unauthorized():
    response = client.get("/tickets")
    assert response.status_code == 401
