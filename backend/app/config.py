from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = ""  # default for mypy; real value comes from .env
    JWT_SECRET: str = ""  # default for mypy; real value comes from .env
    JWT_EXPIRE_MINUTES: int = 10080
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    LOG_LEVEL: str = "info"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings: "Settings" = Settings()
