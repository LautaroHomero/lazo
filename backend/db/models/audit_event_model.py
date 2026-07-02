from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from db.base import Base


class AuditEventModel(Base):

    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    # Clave foránea que conecta con la tabla obligations
    obligation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("obligations.id", ondelete="CASCADE"),
        nullable=False,
    )

    from_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    to_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    # Relación inversa hacia ObligationModel
    obligation = relationship(
        "ObligationModel",
        back_populates="audit_events",
    )
