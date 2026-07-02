import unittest
from datetime import date
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.base import Base
from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType
from domain.errors import ConcurrencyConflictError
from infraestructure.repositories.repositories.postgres_obligation_repository import (
    PostgresObligationRepository,
)


class TestConcurrency(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine)
        Base.metadata.create_all(self.engine)
        self.repo = PostgresObligationRepository(self.session_factory)

    def tearDown(self):
        Base.metadata.drop_all(self.engine)

    def test_second_update_fails_when_version_has_changed(self):
        obligation = Obligation(
            id=uuid4(),
            title="Annual report",
            description="Test concurrency",
            type=ObligationType.ANNUAL_REPORT,
            status=ObligationStatus.PENDING,
            due_date=date(2026, 12, 31),
            owner="Compliance",
            requires_document=False,
            company_tax_id="123456789",
        )

        saved = self.repo.save(obligation)

        first_read = self.repo.get_by_id(saved.id)
        second_read = self.repo.get_by_id(saved.id)

        self.assertIsNotNone(first_read)
        self.assertIsNotNone(second_read)

        first_read.change_status(ObligationStatus.IN_PROGRESS)
        self.repo.update(first_read)

        second_read.change_status(ObligationStatus.IN_PROGRESS)

        with self.assertRaises(ConcurrencyConflictError):
            self.repo.update(second_read)


if __name__ == "__main__":
    unittest.main()
