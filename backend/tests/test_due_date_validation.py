import unittest
from datetime import date, timedelta

from application.create_obligation import CreateObligation
from application.update_obligation import UpdateObligation
from db.base import Base
from domain.enums import ObligationType
from domain.errors import InvalidDueDateError
from infraestructure.repositories.repositories.postgres_obligation_repository import (
    PostgresObligationRepository,
)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class TestDueDateValidation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        Base.metadata.drop_all(self.engine)
        Base.metadata.create_all(self.engine)
        self.session_factory = lambda: self.Session()
        self.repository = PostgresObligationRepository(self.session_factory)
        self.use_case = CreateObligation(self.repository)

    def test_create_raises_if_due_date_is_in_the_past(self):
        yesterday = date.today() - timedelta(days=1)

        with self.assertRaises(InvalidDueDateError):
            self.use_case.execute(
                title="Annual report",
                description="Past due date not allowed",
                obligation_type=ObligationType.ANNUAL_REPORT,
                due_date=yesterday,
                owner="Compliance",
                requires_document=False,
                company_tax_id="123456789",
            )

    def test_update_allows_renaming_an_already_overdue_obligation(self):
        tomorrow = date.today() + timedelta(days=1)
        yesterday = date.today() - timedelta(days=1)

        created = self.use_case.execute(
            title="Annual report",
            description="Overdue obligation",
            obligation_type=ObligationType.ANNUAL_REPORT,
            due_date=tomorrow,
            owner="Compliance",
            requires_document=False,
            company_tax_id="123456789",
        )

        # Simulate the due date already being in the past, as would happen
        # naturally once time passes for an obligation that was never updated.
        stored = self.repository.get_by_id(created.id)
        assert stored is not None
        stored.due_date = yesterday
        self.repository.update(stored)

        update_use_case = UpdateObligation(self.repository)

        updated = update_use_case.execute(
            created.id,
            title="Annual report (renamed)",
            due_date=yesterday,
        )

        self.assertEqual(updated.title, "Annual report (renamed)")
        self.assertEqual(updated.due_date, yesterday)

    def test_update_allows_moving_an_overdue_obligation_to_a_future_date(self):
        tomorrow = date.today() + timedelta(days=1)
        yesterday = date.today() - timedelta(days=1)
        next_month = date.today() + timedelta(days=30)

        created = self.use_case.execute(
            title="Annual report",
            description="Overdue obligation",
            obligation_type=ObligationType.ANNUAL_REPORT,
            due_date=tomorrow,
            owner="Compliance",
            requires_document=False,
            company_tax_id="123456789",
        )

        stored = self.repository.get_by_id(created.id)
        assert stored is not None
        stored.due_date = yesterday
        self.repository.update(stored)

        update_use_case = UpdateObligation(self.repository)

        updated = update_use_case.execute(created.id, due_date=next_month)

        self.assertEqual(updated.due_date, next_month)

    def test_update_rejects_moving_due_date_to_a_new_past_date(self):
        tomorrow = date.today() + timedelta(days=1)
        two_days_ago = date.today() - timedelta(days=2)

        created = self.use_case.execute(
            title="Annual report",
            description="Not yet overdue",
            obligation_type=ObligationType.ANNUAL_REPORT,
            due_date=tomorrow,
            owner="Compliance",
            requires_document=False,
            company_tax_id="123456789",
        )

        update_use_case = UpdateObligation(self.repository)

        with self.assertRaises(InvalidDueDateError):
            update_use_case.execute(created.id, due_date=two_days_ago)


if __name__ == "__main__":
    unittest.main()
