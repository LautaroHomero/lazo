from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4

from domain.enums import ObligationStatus


@dataclass(frozen=True, slots=True)
class AuditEvent:
    id: UUID
    obligation_id: UUID
    from_status: ObligationStatus
    to_status: ObligationStatus
    created_at: datetime

    @classmethod
    def create(
        cls,
        obligation_id: UUID,
        from_status: ObligationStatus,
        to_status: ObligationStatus,
    ) -> "AuditEvent":

        return cls(
            id=uuid4(),
            obligation_id=obligation_id,
            from_status=from_status,
            to_status=to_status,
            created_at=datetime.utcnow(),
        )