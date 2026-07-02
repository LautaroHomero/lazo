from __future__ import annotations

from datetime import date
from uuid import uuid4

from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType
from domain.errors import InvalidDueDateError
from domain.repositories.obligation_repository import ObligationRepository


class CreateObligation:
    def __init__(self, repository: ObligationRepository):
        self._repository = repository

    def execute(
        self,
        *,
        title: str,
        description: str,
        obligation_type: str | ObligationType,
        due_date: date | str,
        owner: str,
        requires_document: bool,
        company_tax_id: str,
    ) -> Obligation:
        parsed_due_date = (
            due_date if isinstance(due_date, date) else date.fromisoformat(str(due_date))
        )

        if parsed_due_date < date.today():
            raise InvalidDueDateError("due_date cannot be in the past")

        obligation = Obligation(
            id=uuid4(),
            title=title,
            description=description,
            type=(
                obligation_type
                if isinstance(obligation_type, ObligationType)
                else ObligationType(obligation_type)
            ),
            status=ObligationStatus.PENDING,
            due_date=parsed_due_date,
            owner=owner,
            requires_document=requires_document,
            company_tax_id=company_tax_id,
        )
        return self._repository.save(obligation)
