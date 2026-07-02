from datetime import date
from uuid import uuid4

from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from db.base import Base


class ObligationModel(Base):

    __tablename__ = "obligations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    due_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    owner: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    requires_document: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    company_tax_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    document = relationship(
        "DocumentModel",
        back_populates="obligation",
        uselist=False,
        cascade="all, delete-orphan",
    )

    audit_events = relationship(
        "AuditEventModel",
        back_populates="obligation",
        cascade="all, delete-orphan",
        order_by="AuditEventModel.created_at",
    )