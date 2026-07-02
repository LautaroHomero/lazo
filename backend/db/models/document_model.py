from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class DocumentModel(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    content: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    storage_path: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    obligation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("obligations.id", ondelete="CASCADE"),
        nullable=False,
    )

    obligation = relationship(
        "ObligationModel",
        back_populates="document",
    )