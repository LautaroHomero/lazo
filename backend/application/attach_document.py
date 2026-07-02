from __future__ import annotations

from domain.entities.document import Document
from domain.entities.obligation import Obligation
from domain.errors import EntityNotFoundError
from domain.repositories.obligation_repository import ObligationRepository


class AttachDocument:
    def __init__(self, repository: ObligationRepository):
        self._repository = repository

    def execute(self, obligation_id, file_name: str, storage_path: str, mime_type: str | None = None, content: bytes | None = None) -> Obligation:
        obligation = self._repository.get_by_id(obligation_id)
        if obligation is None:
            raise EntityNotFoundError(f"Obligation {obligation_id} not found")

        obligation.attach_document(
            Document.create(file_name=file_name, storage_path=storage_path, mime_type=mime_type, content=content)
        )
        return self._repository.update(obligation)
