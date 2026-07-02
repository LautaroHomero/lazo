from __future__ import annotations

from datetime import date

from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType
from domain.errors import EntityNotFoundError, InvalidDueDateError
from domain.repositories.obligation_repository import ObligationRepository


class UpdateObligation:
    def __init__(self, repository: ObligationRepository):
        self._repository = repository

    def execute(
        self,
        obligation_id,
        *,
        title: str | None = None,
        description: str | None = None,
        obligation_type: str | ObligationType | None = None,
        due_date: date | str | None = None,
        owner: str | None = None,
        requires_document: bool | None = None,
        company_tax_id: str | None = None,
        status: str | ObligationStatus | None = None,
    ) -> Obligation:
        obligation = self._repository.get_by_id(obligation_id)
        if obligation is None:
            raise EntityNotFoundError(f"Obligation {obligation_id} not found")

        if title is not None:
            obligation.title = title
        if description is not None:
            obligation.description = description
        if obligation_type is not None:
            obligation.type = (
                obligation_type
                if isinstance(obligation_type, ObligationType)
                else ObligationType(obligation_type)
            )
        if due_date is not None:
            parsed_due_date = (
                due_date
                if isinstance(due_date, date)
                else date.fromisoformat(str(due_date))
            )
            due_date_is_changing = parsed_due_date != obligation.due_date
            if due_date_is_changing and parsed_due_date < date.today():
                raise InvalidDueDateError("due_date cannot be in the past")
            obligation.due_date = parsed_due_date
        if owner is not None:
            obligation.owner = owner
        if requires_document is not None:
            obligation.requires_document = requires_document
        if company_tax_id is not None:
            obligation.company_tax_id = company_tax_id
        if status is not None:
            obligation.change_status(
                status
                if isinstance(status, ObligationStatus)
                else ObligationStatus(status)
            )

        return self._repository.update(obligation)
