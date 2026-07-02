from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass(slots=True)
class Document:
    id: UUID
    file_name: str
    storage_path: str
    uploaded_at: datetime
    mime_type: str | None = None
    content: bytes | None = None

    @classmethod
    def create(
        cls,
        file_name: str,
        storage_path: str,
        mime_type: str | None = None,
        content: bytes | None = None
    ) -> "Document":

        return cls(
            id=uuid4(),
            file_name=file_name,
            storage_path=storage_path,
            uploaded_at=datetime.utcnow(),
            mime_type=mime_type,
            content=content
        )