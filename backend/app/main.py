
import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.services.demo_data import (
    get_all_customers,
    get_customer_by_id,
    get_portfolio_summary,
    get_early_warnings,
)

app = FastAPI(
    title="CreditGuard AI",
    description="AI-powered Credit Risk Early Warning System",
    version="1.0.0",
)

# Local development + production frontend origins
frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

production_frontend_url = os.getenv("FRONTEND_URL", "").strip()

if production_frontend_url:
    frontend_origins.extend(
        origin.strip().rstrip("/")
        for origin in production_frontend_url.split(",")
        if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "application": "CreditGuard AI",
        "status": "running",
        "message": "Credit risk intelligence platform",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "application": "CreditGuard AI",
        "data_source": "synthetic_demo_data",
    }


@app.get("/api/customers")
def customers(
    search: str = Query(default=""),
    risk_level: str = Query(default=""),
):
    results = get_all_customers()

    if search:
        search_term = search.lower()

        results = [
            customer for customer in results
            if search_term in customer["name"].lower()
            or search_term in customer["id"].lower()
            or search_term in customer["loan_type"].lower()
        ]

    if risk_level:
        results = [
            customer for customer in results
            if customer["risk_level"].lower() == risk_level.lower()
        ]

    return {
        "total": len(results),
        "customers": results,
    }


@app.get("/api/customers/{customer_id}")
def customer_details(customer_id: str):
    customer = get_customer_by_id(customer_id)

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


@app.get("/api/portfolio")
def portfolio():
    return get_portfolio_summary()


@app.get("/api/warnings")
def warnings():
    results = get_early_warnings()

    return {
        "total": len(results),
        "warnings": results,
    }
