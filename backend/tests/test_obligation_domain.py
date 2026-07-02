import unittest
from datetime import date
from uuid import uuid4

from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType


class TestObligationDomain(unittest.TestCase):
    def test_submitted_is_not_available_when_document_is_required_and_missing(self):
        obligation = Obligation(
            id=uuid4(),
            title="Annual report",
            description="Need document",
            type=ObligationType.ANNUAL_REPORT,
            status=ObligationStatus.PENDING,
            due_date=date(2026, 12, 31),
            owner="Compliance",
            requires_document=True,
            company_tax_id="123456789",
        )

        transitions = obligation.available_transitions()

        self.assertNotIn(ObligationStatus.SUBMITTED, transitions)


if __name__ == "__main__":
    unittest.main()
