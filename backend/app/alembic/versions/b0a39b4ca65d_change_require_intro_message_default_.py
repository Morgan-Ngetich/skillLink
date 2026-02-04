"""Change require_intro_message default Field value to False

Revision ID: b0a39b4ca65d
Revises: 8178065e7069
Create Date: 2026-01-27 15:09:12.132804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b0a39b4ca65d'
down_revision: Union[str, Sequence[str], None] = '8178065e7069'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Set server default to false
    op.alter_column(
        'mentorsettings',
        'require_intro_message',
        existing_type=sa.Boolean(),
        server_default=sa.text('false'),  # or just 'false'
        existing_nullable=False
    )
    
    # Optional: Update existing rows to false
    op.execute(
        "UPDATE mentorsettings SET require_intro_message = false WHERE require_intro_message = true"
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Remove server default (or set to previous value if there was one)
    op.alter_column(
        'mentorsettings',
        'require_intro_message',
        existing_type=sa.Boolean(),
        server_default=None,  # or 'true' if that was the old default
        existing_nullable=False
    )