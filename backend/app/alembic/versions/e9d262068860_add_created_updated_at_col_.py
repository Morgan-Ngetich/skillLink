"""Add created_updated_at col -> MentorSettings

Revision ID: e9d262068860
Revises: ea700f0c7cda
Create Date: 2025-11-07 06:01:39.126885
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "e9d262068860"
down_revision: Union[str, Sequence[str], None] = "ea700f0c7cda"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns as nullable first (to avoid NOT NULL violation)
    op.add_column(
        "mentorsettings",
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.add_column(
        "mentorsettings",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )

    # Backfill existing rows with current timestamp
    op.execute("UPDATE mentorsettings SET created_at = NOW(), updated_at = NOW();")

    # Make them NOT NULL after backfilling
    op.alter_column("mentorsettings", "created_at", nullable=False)
    op.alter_column("mentorsettings", "updated_at", nullable=False)


def downgrade() -> None:
    op.drop_column("mentorsettings", "updated_at")
    op.drop_column("mentorsettings", "created_at")
