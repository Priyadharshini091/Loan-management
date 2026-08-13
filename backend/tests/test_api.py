import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_login_admin():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "Admin"

def test_login_staff():
    response = client.post("/api/auth/login", json={"username": "staff", "password": "staff123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "staff"

def test_areas_list():
    login_resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/areas", headers=headers)
    assert response.status_code == 200
    areas = response.json()
    assert len(areas) >= 4
    area_names = [a["area_name"] for a in areas]
    assert "Thogamalai" in area_names
    assert "Kulithalai" in area_names

def test_dashboard_api():
    login_resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] >= 10
    assert len(data["area_summaries"]) >= 4

def test_area_dashboard_thogamalai():
    login_resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard/area/AREA001", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["area_name"] == "Thogamalai"
    assert data["total_customers"] >= 5

def test_customers_api():
    login_resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/customers?area_id=AREA001", headers=headers)
    assert response.status_code == 200
    custs = response.json()
    assert len(custs) >= 5

def test_loan_calculation():
    login_resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "loan_amount": 50000,
        "interest_percentage": 12,
        "emi_type": "Daily",
        "number_of_installments": 100,
        "first_due_date": "2026-08-14"
    }
    response = client.post("/api/loans/calculate", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["interest_amount"] == 6000.0
    assert data["total_payable"] == 56000.0
    assert data["emi_amount"] == 560.0
