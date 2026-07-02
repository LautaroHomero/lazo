import unittest
from datetime import date
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.base import Base
from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType
from infraestructure.repositories.repositories.postgres_obligation_repository import (
    PostgresObligationRepository,
)


class TestPostgresObligationRepository(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        Base.metadata.drop_all(self.engine)
        Base.metadata.create_all(self.engine)
        self.repo = PostgresObligationRepository(self.Session)

    def test_save_and_get_by_id(self):
        obligation = Obligation(
            id=uuid4(),
            title="Annual report",
            description="File annual report",
            type=ObligationType.ANNUAL_REPORT,
            status=ObligationStatus.PENDING,
            due_date=date(2026, 12, 31),
            owner="Finance",
            requires_document=False,
            company_tax_id="123456789",
        )

        saved = self.repo.save(obligation)
        self.assertEqual(saved.id, obligation.id)
        self.assertEqual(saved.title, "Annual report")

        loaded = self.repo.get_by_id(obligation.id)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.title, "Annual report")
        self.assertEqual(loaded.status, ObligationStatus.PENDING)


if __name__ == "__main__":
    unittest.main()
