from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./lazo.db"

    # Comma-separated list of origins allowed to call the API (CORS).
    # Add your deployed frontend's origin(s) here in production, e.g.:
    # "https://your-app.vercel.app,http://localhost:3000"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Optional regex to allow a whole family of origins, useful for
    # Vercel preview deployments (e.g. r"https://.*\.vercel\.app").
    allowed_origin_regex: str | None = None

    # Public base URL of this backend, used to build absolute links to
    # uploaded documents (e.g. "https://your-backend.onrender.com").
    # Defaults to the local Docker Compose setup, where the backend is
    # reachable from the host machine's browser via localhost:8000.
    public_base_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


settings = Settings()
