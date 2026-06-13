from fastapi.testclient import TestClient
from app import app
import pytest
from tests.conftest import client

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to SupportLens API"}

def test_register():
    response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "testauth@example.com",
        "password": "password123",
        "company": "Test Co"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testauth@example.com"
    assert "id" in data
