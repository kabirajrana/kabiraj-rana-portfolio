from functools import lru_cache

from pydantic import Field
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

	app_env: str = Field(default="development", alias="APP_ENV")
	allowed_origins: str = Field(default="", alias="ALLOWED_ORIGINS")
	frontend_origin: str = Field(default="http://localhost:3000", alias="FRONTEND_ORIGIN")

	mail_provider: str = Field(default="smtp", alias="MAIL_PROVIDER")

	resend_api_key: str = Field(default="", alias="RESEND_API_KEY")
	resend_from: str = Field(default="", alias="RESEND_FROM")
	resend_to: str = Field(default="", alias="RESEND_TO")

	smtp_host: str = Field(default="", alias="SMTP_HOST")
	smtp_port: int = Field(default=587, alias="SMTP_PORT")
	smtp_user: str = Field(default="", alias="SMTP_USER")
	smtp_pass: str = Field(default="", alias="SMTP_PASS")
	smtp_from: str = Field(default="", alias="SMTP_FROM")
	smtp_to: str = Field(default="", alias="SMTP_TO")

	contact_rate_limit: int = Field(default=5, alias="CONTACT_RATE_LIMIT")
	contact_rate_window_sec: int = Field(default=60, alias="CONTACT_RATE_WINDOW_SEC")

	@model_validator(mode="after")
	def validate_production_config(self) -> "Settings":
		is_production = self.app_env.lower() == "production"
		if is_production and not self.allowed_origins.strip():
			raise ValueError("ALLOWED_ORIGINS must be set when APP_ENV=production")
		return self

	@property
	def cors_origins(self) -> list[str]:
		if self.allowed_origins.strip():
			return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
		if self.frontend_origin.strip():
			return [self.frontend_origin.strip()]
		return []


@lru_cache
def get_settings() -> Settings:
	return Settings()
