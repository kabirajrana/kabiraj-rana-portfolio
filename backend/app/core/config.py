from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_FILE), extra="ignore")

    app_name: str = "worldclass-portfolio-backend"
    env: str = "development"
    database_url: str = "sqlite:///./app.db"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    rate_limit_default: str = "60/minute"

    cors_allow_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    contact_inbox_email: str = ""
    mail_from_email: str = ""
    mail_from_name: str = "Kabiraj Rana"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    smtp_timeout_seconds: int = 20


settings = Settings()
