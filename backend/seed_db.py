from datetime import date, timedelta
import db.models.obligation_model
import db.models.document_model
import db.models.audit_event_model
from db.base import Base
from db.session import engine
from application.attach_document import AttachDocument
from application.change_status import ChangeStatus
from application.create_obligation import CreateObligation
from infraestructure.repositories.repositories.postgres_obligation_repository import (
    PostgresObligationRepository,
)
from domain.enums import ObligationType


def seed_database() -> None:
    print("Seeding database...")

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    repository = PostgresObligationRepository()
    create_obligation = CreateObligation(repository)
    change_status = ChangeStatus(repository)
    attach_document = AttachDocument(repository)

    # 1. Pending obligation without document
    create_obligation.execute(
        title="Annual report",
        description="Prepare and file annual compliance report.",
        obligation_type=ObligationType.ANNUAL_REPORT,
        due_date=date.today() + timedelta(days=30),
        owner="Compliance Team",
        requires_document=False,
        company_tax_id="123456789",
    )

    # 2. In progress obligation with document attached
    in_progress = create_obligation.execute(
        title="Franchise tax return",
        description="Calculate and file franchise tax.",
        obligation_type=ObligationType.FRANCHISE_TAX,
        due_date=date.today() + timedelta(days=15),
        owner="Finance",
        requires_document=True,
        company_tax_id="987654321",
    )

    attach_document.execute(
        obligation_id=in_progress.id,
        file_name="franchise_tax_draft.pdf",
        storage_path="/tmp/franchise_tax_draft.pdf",
        mime_type="application/pdf",
        content=b"dummy pdf content",
    )

    change_status.execute(in_progress.id, "in_progress")

    # 3. Submitted obligation with audit trail
    submitted = create_obligation.execute(
        title="BOI report",
        description="Submit BOI report for the current year.",
        obligation_type=ObligationType.BOI_REPORT,
        due_date=date.today() + timedelta(days=5),
        owner="Operations",
        requires_document=True,
        company_tax_id="555554444",
    )

    attach_document.execute(
        obligation_id=submitted.id,
        file_name="boi_report.pdf",
        storage_path="/tmp/boi_report.pdf",
        mime_type="application/pdf",
        content=b"dummy pdf content",
    )

    change_status.execute(submitted.id, "in_progress")
    change_status.execute(submitted.id, "submitted")

    # 4. Done obligation for reopened flow
    done = create_obligation.execute(
        title="Registered agent renewal",
        description="Renew registered agent service.",
        obligation_type=ObligationType.REGISTERED_AGENT_RENEWAL,
        due_date=date.today() + timedelta(days=10),
        owner="Legal",
        requires_document=False,
        company_tax_id="222223333",
    )

    change_status.execute(done.id, "in_progress")
    change_status.execute(done.id, "submitted")
    change_status.execute(done.id, "done")

    print("Seed complete.")


if __name__ == "__main__":
    seed_database()