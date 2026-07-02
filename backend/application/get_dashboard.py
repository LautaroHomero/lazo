from __future__ import annotations

from domain.enums import ObligationStatus
from domain.repositories.obligation_repository import ObligationRepository


class GetDashboard:
    def __init__(self, repository: ObligationRepository):
        self._repository = repository

    def execute(self) -> dict[ObligationStatus, list]:
        dashboard: dict[ObligationStatus, list] = {
            status: [] for status in ObligationStatus
        }

        for obligation in self._repository.list_all():
            dashboard[obligation.status].append(obligation)

        return dashboard
