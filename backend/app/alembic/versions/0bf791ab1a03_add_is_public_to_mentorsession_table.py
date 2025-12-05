"""Add is_public to MentorSession table

Revision ID: 0bf791ab1a03
Revises: e9d262068860
Create Date: 2025-11-24 02:46:07.250255

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0bf791ab1a03'
down_revision: Union[str, Sequence[str], None] = 'e9d262068860'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_public with a server_default to avoid NOT NULL issues on existing rows
    op.add_column(
        'mentorsession',
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('true'))
    )

    # Optional: remove the server_default if you only want it for migration
    op.alter_column('mentorsession', 'is_public', server_default=None)

    op.alter_column('mentorsettings', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=False,
               existing_server_default=sa.text('now()'))
    op.alter_column('mentorsettings', 'updated_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=False,
               existing_server_default=sa.text('now()'))


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('mentorsettings', 'updated_at',
               existing_type=sa.DateTime(),
               type_=postgresql.TIMESTAMP(timezone=True),
               existing_nullable=False,
               existing_server_default=sa.text('now()'))
    op.alter_column('mentorsettings', 'created_at',
               existing_type=sa.DateTime(),
               type_=postgresql.TIMESTAMP(timezone=True),
               existing_nullable=False,
               existing_server_default=sa.text('now()'))
    op.drop_column('mentorsession', 'is_public')
