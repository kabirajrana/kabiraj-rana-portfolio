from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "worldclass-portfolio-backend"
    env: str = "development"
    database_url: str = "sqlite:///./app.db"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    rate_limit_default: str = "60/minute"


settings = Settings()
