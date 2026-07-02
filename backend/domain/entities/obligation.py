from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from uuid import UUID

from domain.entities.audit_event import AuditEvent
from domain.entities.document import Document
from domain.enums import ObligationStatus, ObligationType
from domain.errors import DocumentRequiredError
from domain.state_machine import StateMachine


@dataclass(slots=True)
class Obligation:
    id: UUID
    title: str
    description: str
    type: ObligationType
    status: ObligationStatus
    due_date: date
    owner: str

    requires_document: bool
    company_tax_id: str

    version: int = 1

    document: Document | None = None

    audit_events: list[AuditEvent] = field(default_factory=list)

    def change_status(self, new_status: ObligationStatus) -> None:
        """
        Change the obligation status applying all business rules.
        """

        StateMachine.validate_transition(
            self.status,
            new_status,
        )

        if (
            new_status == ObligationStatus.SUBMITTED
            and self.requires_document
            and self.document is None
        ):
            raise DocumentRequiredError(
                "A document must be attached before submitting."
            )

        previous_status = self.status

        self.status = new_status

        self.audit_events.append(
            AuditEvent.create(
                obligation_id=self.id,
                from_status=previous_status,
                to_status=new_status,
            )
        )

    def attach_document(
        self,
        document: Document,
    ) -> None:

        self.document = document

    def remove_document(self) -> None:

        self.document = None

    def is_overdue(
        self,
        today: date,
    ) -> bool:

        if self.status in (
            ObligationStatus.SUBMITTED,
            ObligationStatus.DONE,
        ):
            return False

        return self.due_date < today

    def masked_tax_id(self) -> str:

        digits = self.company_tax_id[-4:]

        return f"••••{digits}"

    def available_transitions(
        self,
    ) -> list[ObligationStatus]:

        transitions = StateMachine.allowed_transitions(self.status)

        if self.requires_document and self.document is None:
            transitions = [
                transition
                for transition in transitions
                if transition != ObligationStatus.SUBMITTED
            ]

        return transitions

    def can_transition_to(self, new_status: ObligationStatus) -> bool:
        return new_status in self.available_transitions()