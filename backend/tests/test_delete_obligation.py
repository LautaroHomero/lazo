import unittest
from datetime import date
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from application.delete_obligation import DeleteObligation
from db.base import Base
from domain.entities.obligation import Obligation
from domain.enums import ObligationStatus, ObligationType
from infraestructure.repositories.repositories.postgres_obligation_repository import (
    PostgresObligationRepository,
)


class TestDeleteObligation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        Base.metadata.drop_all(self.engine)
        Base.metadata.create_all(self.engine)
        self.session_factory = lambda: self.Session()
        self.repository = PostgresObligationRepository(self.session_factory)
        self.use_case = DeleteObligation(self.repository)

    def test_delete_removes_obligation(self):
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

        self.repository.save(obligation)
        self.use_case.execute(obligation.id)

        self.assertIsNone(self.repository.get_by_id(obligation.id))


if __name__ == "__main__":
    unittest.main()
