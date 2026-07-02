from uuid import UUID

from db.models.audit_event_model import AuditEventModel
from db.models.document_model import DocumentModel
from db.models.obligation_model import ObligationModel
from domain.entities.audit_event import AuditEvent
from domain.entities.document import Document
from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType


class ObligationMapper:
    @staticmethod
    def to_domain(model: ObligationModel) -> Obligation:
        """
        Convert an ObligationModel (database) to an Obligation (domain entity).
        """
        document = None
        if model.document:
            document = ObligationMapper._document_model_to_domain(model.document)

        audit_events = []
        if model.audit_events:
            audit_events = [
                ObligationMapper._audit_event_model_to_domain(event)
                for event in model.audit_events
            ]

        return Obligation(
            id=UUID(model.id),
            title=model.title,
            description=model.description,
            type=ObligationType(model.type),
            status=ObligationStatus(model.status),
            due_date=model.due_date,
            owner=model.owner,
            requires_document=model.requires_document,
            company_tax_id=model.company_tax_id,
            version=model.version,
            document=document,
            audit_events=audit_events,
        )

    @staticmethod
    def to_persistence(obligation: Obligation) -> ObligationModel:
        """
        Convert an Obligation (domain entity) to an ObligationModel (database).
        """
        model = ObligationModel(
            id=str(obligation.id),
            title=obligation.title,
            description=obligation.description,
            type=obligation.type.value,
            status=obligation.status.value,
            due_date=obligation.due_date,
            owner=obligation.owner,
            requires_document=obligation.requires_document,
            company_tax_id=obligation.company_tax_id,
            version=obligation.version,
        )

        if obligation.document:
            model.document = ObligationMapper._document_to_model(
                obligation.document
            )
            model.document.obligation_id = str(obligation.id)

        if obligation.audit_events:
            model.audit_events = [
                ObligationMapper._audit_event_to_model(event)
                for event in obligation.audit_events
            ]

        return model

    @staticmethod
    def _document_model_to_domain(model: DocumentModel) -> Document:
        return Document(
            id=UUID(model.id),
            file_name=model.name,
            mime_type=model.mime_type,
            content=model.content,
            uploaded_at=model.created_at,
            storage_path=model.storage_path,
    )

    @staticmethod
    def _document_to_model(document: Document) -> DocumentModel:
        return DocumentModel(
            id=str(document.id),
            name=document.file_name,
            mime_type=document.mime_type,
            content=document.content,
            created_at=document.uploaded_at,
            storage_path=document.storage_path,
    )

    @staticmethod
    def _audit_event_model_to_domain(model: AuditEventModel) -> AuditEvent:
        """Convert AuditEventModel to AuditEvent domain entity."""
        return AuditEvent(
            id=UUID(model.id),
            obligation_id=UUID(model.obligation_id),
            from_status=ObligationStatus(model.from_status),
            to_status=ObligationStatus(model.to_status),
            created_at=model.created_at,
        )

    @staticmethod
    def _audit_event_to_model(event: AuditEvent) -> AuditEventModel:
        """Convert AuditEvent domain entity to AuditEventModel."""
        return AuditEventModel(
            id=str(event.id),
            obligation_id=str(event.obligation_id),
            from_status=event.from_status.value,
            to_status=event.to_status.value,
            created_at=event.created_at,
        )
