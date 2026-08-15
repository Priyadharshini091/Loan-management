import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Loan Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = "loan_management_super_secret_jwt_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    REPORT_EMAIL: str = "vfffinance@gmail.com"

    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    EXCEL_FILE_PATH: str = os.path.join(BASE_DIR, "data", "loan_management.xlsx")
    BACKUP_DIR: str = os.path.join(BASE_DIR, "data", "backups")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.makedirs(os.path.dirname(settings.EXCEL_FILE_PATH), exist_ok=True)
os.makedirs(settings.BACKUP_DIR, exist_ok=True)
