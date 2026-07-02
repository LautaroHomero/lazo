from enum import Enum


class ObligationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    DONE = "done"


class ObligationType(str, Enum):
    ANNUAL_REPORT = "annual_report"
    FRANCHISE_TAX = "franchise_tax"
    BOI_REPORT = "boi_report"
    REGISTERED_AGENT_RENEWAL = "registered_agent_renewal"