from __future__ import annotations

from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus
from domain.errors import EntityNotFoundError
from domain.repositories.obligation_repository import ObligationRepository


class ChangeStatus:
    def __init__(self, repository: ObligationRepository):
        self._repository = repository

    def execute(self, obligation_id, new_status: str | ObligationStatus) -> Obligation:
        obligation = self._repository.get_by_id(obligation_id)
        if obligation is None:
            raise EntityNotFoundError(f"Obligation {obligation_id} not found")

        obligation.change_status(
            new_status
            if isinstance(new_status, ObligationStatus)
            else ObligationStatus(new_status)
        )
        return self._repository.update(obligation)
