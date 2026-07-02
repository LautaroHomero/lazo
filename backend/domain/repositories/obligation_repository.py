from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.obligation import Obligation


class ObligationRepository(ABC):
    @abstractmethod
    def save(self, obligation: Obligation) -> Obligation:
        """Persist a new obligation."""

    @abstractmethod
    def get_by_id(self, obligation_id: UUID) -> Obligation | None:
        """Retrieve an obligation by id."""

    @abstractmethod
    def list_all(self) -> list[Obligation]:
        """Return all obligations."""

    @abstractmethod
    def update(self, obligation: Obligation) -> Obligation:
        """Update an existing obligation."""

    @abstractmethod
    def delete(self, obligation_id: UUID) -> None:
        """Delete an obligation by id."""
