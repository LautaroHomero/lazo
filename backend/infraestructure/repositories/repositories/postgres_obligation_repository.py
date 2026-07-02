from __future__ import annotations

from typing import Callable
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.mappers.obligation_mapper import ObligationMapper
from db.models.obligation_model import ObligationModel
from db.session import SessionLocal
from domain.entities.obligation import Obligation
from domain.errors import ConcurrencyConflictError, EntityNotFoundError
from domain.repositories.obligation_repository import ObligationRepository


class PostgresObligationRepository(ObligationRepository):
    def __init__(self, session_factory: Callable[[], Session] | None = None):
        self._session_factory = session_factory or SessionLocal

    def save(self, obligation: Obligation) -> Obligation:
        with self._session_factory() as session:
            model = ObligationMapper.to_persistence(obligation)
            session.add(model)
            session.commit()
            session.refresh(model)
            return ObligationMapper.to_domain(model)

    def get_by_id(self, obligation_id: UUID) -> Obligation | None:
        with self._session_factory() as session:
            model = session.get(ObligationModel, str(obligation_id))
            if model is None:
                return None
            return ObligationMapper.to_domain(model)

    def list_all(self) -> list[Obligation]:
        with self._session_factory() as session:
            models = session.scalars(select(ObligationModel)).all()
            return [ObligationMapper.to_domain(model) for model in models]

    def update(self, obligation: Obligation) -> Obligation:
        with self._session_factory() as session:
            model = session.get(ObligationModel, str(obligation.id))
            if model is None:
                raise EntityNotFoundError(f"Obligation {obligation.id} not found")

            if model.version != obligation.version:
                raise ConcurrencyConflictError(
                    "The obligation was modified by another request."
                )

            model.title = obligation.title
            model.description = obligation.description
            model.type = obligation.type.value
            model.status = obligation.status.value
            model.due_date = obligation.due_date
            model.owner = obligation.owner
            model.requires_document = obligation.requires_document
            model.company_tax_id = obligation.company_tax_id
            model.version = model.version + 1

            if obligation.document is not None:
                model.document = ObligationMapper._document_to_model(
                    obligation.document
                )
                model.document.obligation_id = str(obligation.id)
            else:
                model.document = None

            if obligation.audit_events:
                model.audit_events = [
                    ObligationMapper._audit_event_to_model(event)
                    for event in obligation.audit_events
                ]
            else:
                model.audit_events = []

            session.commit()
            session.refresh(model)
            return ObligationMapper.to_domain(model)

    def delete(self, obligation_id: UUID) -> None:
        with self._session_factory() as session:
            model = session.get(ObligationModel, str(obligation_id))
            if model is None:
                return
            session.delete(model)
            session.commit()
