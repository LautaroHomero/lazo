from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import AliasChoices, BaseModel, Field


class CreateObligationRequest(BaseModel):
    title: str
    description: str
    obligation_type: str = Field(
        ..., validation_alias=AliasChoices("obligation_type", "type")
    )
    due_date: date
    owner: str
    requires_document: bool = False
    company_tax_id: str


class UpdateObligationRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    obligation_type: str | None = Field(
        default=None, validation_alias=AliasChoices("obligation_type", "type")
    )
    due_date: date | None = None
    owner: str | None = None
    requires_document: bool | None = None
    company_tax_id: str | None = None


class ChangeStatusRequest(BaseModel):
    new_status: str


class AttachDocumentRequest(BaseModel):
    file_name: str
    storage_path: str


class ObligationResponse(BaseModel):
    id: str
    title: str
    description: str
    type: str
    status: str
    due_date: date
    owner: str
    requires_document: bool
    company_tax_id: str
    version: int
    is_overdue: bool
    available_transitions: list[str] = Field(default_factory=list)
    can_submit: bool = False
    document: dict[str, Any] | None = None
    audit_events: list[dict[str, Any]] = Field(default_factory=list)
