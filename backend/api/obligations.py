from __future__ import annotations

from datetime import date
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, File, UploadFile, status

from application.attach_document import AttachDocument
from application.change_status import ChangeStatus
from application.create_obligation import CreateObligation
from application.delete_obligation import DeleteObligation
from application.get_dashboard import GetDashboard
from application.update_obligation import UpdateObligation
from domain.enums import ObligationStatus
from domain.errors import (
    ConcurrencyConflictError,
    DocumentRequiredError,
    DomainError,
    EntityNotFoundError,
    InvalidTransitionError,
)
from infraestructure.repositories.repositories.postgres_obligation_repository import (
    PostgresObligationRepository,
)
from schemas.obligation_schema import (
    ChangeStatusRequest,
    CreateObligationRequest,
    ObligationResponse,
    UpdateObligationRequest,
)

router = APIRouter(tags=["obligations"])

repository = PostgresObligationRepository()
create_use_case = CreateObligation(repository)
update_use_case = UpdateObligation(repository)
change_status_use_case = ChangeStatus(repository)
attach_document_use_case = AttachDocument(repository)
delete_use_case = DeleteObligation(repository)
get_dashboard_use_case = GetDashboard(repository)


def _mask_company_tax_id(value: str) -> str:
    if len(value) <= 4:
        return "••••"
    return f"••••{value[-4:]}"


def _to_response(obligation) -> ObligationResponse:
    return ObligationResponse(
        id=str(obligation.id),
        title=obligation.title,
        description=obligation.description,
        type=obligation.type.value,
        status=obligation.status.value,
        due_date=obligation.due_date,
        owner=obligation.owner,
        requires_document=obligation.requires_document,
        company_tax_id=_mask_company_tax_id(obligation.company_tax_id),
        version=obligation.version,
        is_overdue=obligation.is_overdue(date.today()),
        available_transitions=[
            transition.value for transition in obligation.available_transitions()
        ],
        can_submit=obligation.can_transition_to(ObligationStatus.SUBMITTED),
        document=(
            {
                "id": str(obligation.document.id),
                "file_name": obligation.document.file_name,
                "storage_path": obligation.document.storage_path,
                "uploaded_at": obligation.document.uploaded_at,
            }
            if obligation.document
            else None
        ),
        audit_events=[
            {
                "id": str(event.id),
                "from_status": event.from_status.value,
                "to_status": event.to_status.value,
                "created_at": event.created_at,
            }
            for event in obligation.audit_events
        ],
    )


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.post(
    "/obligations",
    response_model=ObligationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_obligation(payload: CreateObligationRequest) -> ObligationResponse:
    obligation = create_use_case.execute(
        title=payload.title,
        description=payload.description,
        obligation_type=payload.obligation_type,
        due_date=payload.due_date,
        owner=payload.owner,
        requires_document=payload.requires_document,
        company_tax_id=payload.company_tax_id,
    )
    return _to_response(obligation)


@router.get("/obligations", response_model=list[ObligationResponse])
def list_obligations() -> list[ObligationResponse]:
    return [_to_response(obligation) for obligation in repository.list_all()]


@router.get("/obligations/{obligation_id}", response_model=ObligationResponse)
def get_obligation(obligation_id: str) -> ObligationResponse:
    obligation = repository.get_by_id(UUID(obligation_id))
    if obligation is None:
        raise EntityNotFoundError(f"Obligation {obligation_id} not found")
    return _to_response(obligation)


@router.put("/obligations/{obligation_id}", response_model=ObligationResponse)
def update_obligation(
    obligation_id: str, payload: UpdateObligationRequest
) -> ObligationResponse:
    obligation = update_use_case.execute(
        UUID(obligation_id),
        title=payload.title,
        description=payload.description,
        obligation_type=payload.obligation_type,
        due_date=payload.due_date,
        owner=payload.owner,
        requires_document=payload.requires_document,
        company_tax_id=payload.company_tax_id,
    )
    return _to_response(obligation)


@router.post("/obligations/{obligation_id}/status", response_model=ObligationResponse)
def change_obligation_status(
    obligation_id: str, payload: ChangeStatusRequest
) -> ObligationResponse:
    obligation = change_status_use_case.execute(UUID(obligation_id), payload.new_status)
    return _to_response(obligation)


@router.post("/obligations/{obligation_id}/documents", response_model=ObligationResponse)
def attach_document(
    obligation_id: str,
    file: UploadFile = File(...),
) -> ObligationResponse:
    upload_dir = Path(__file__).resolve().parents[1] / "uploaded_files"
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid4().hex}_{file.filename}"
    stored_path = upload_dir / safe_name
    with stored_path.open("wb") as buffer:
        buffer.write(file.file.read())

    file_url = f"/uploads/{safe_name}"
    content = file.file.read()
    obligation = attach_document_use_case.execute(
        UUID(obligation_id),
        file_name=file.filename,
        storage_path=file_url,
        mime_type=file.content_type,
        content=content,
    )

    return _to_response(obligation)


@router.delete("/obligations/{obligation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_obligation(obligation_id: str) -> None:
    delete_use_case.execute(UUID(obligation_id))


@router.get("/dashboard")
def get_dashboard() -> dict[str, list[dict]]:
    dashboard = get_dashboard_use_case.execute()
    return {
        status.value: [_to_response(obligation).model_dump() for obligation in obligations]
        for status, obligations in dashboard.items()
    }
