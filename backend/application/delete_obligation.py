from __future__ import annotations

from uuid import UUID

from domain.errors import EntityNotFoundError
from domain.repositories.obligation_repository import ObligationRepository


class DeleteObligation:
    def __init__(self, repository: ObligationRepository):
        self._repository = repository

    def execute(self, obligation_id: UUID) -> None:
        obligation = self._repository.get_by_id(obligation_id)
        if obligation is None:
            raise EntityNotFoundError(f"Obligation {obligation_id} not found")

        self._repository.delete(obligation_id)
