from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.seeder import seed_demo_data
from app.routers import (
    auth, areas, customers, loans, payments,
    installments, dashboard, reports, excel, pdf, email, backups
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    seed_demo_data()

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(areas.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(loans.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(installments.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(excel.router, prefix=settings.API_V1_STR)
app.include_router(pdf.router, prefix=settings.API_V1_STR)
app.include_router(email.router, prefix=settings.API_V1_STR)
app.include_router(backups.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
