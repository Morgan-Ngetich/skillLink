"""Fix goals field to ARRAY

Revision ID: c18a7f8fbea3
Revises: 1ff1372134eb
Create Date: 2025-07-09 15:41:22.360033

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel 
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c18a7f8fbea3'
down_revision: Union[str, Sequence[str], None] = '1ff1372134eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Step 1: Convert 'goals' column from text to TEXT[] safely
    op.alter_column(
        'userprofile',
        'goals',
        type_=postgresql.ARRAY(sa.String()),
        existing_type=sa.Text(),
        postgresql_using="string_to_array(goals, ',')"
    )

    # Step 2: Clean up array values (remove stray quotes from each element)
    op.execute("""
        UPDATE userprofile
        SET goals = ARRAY(
            SELECT regexp_replace(elem, '(^"|"$)', '', 'g')
            FROM unnest(goals) AS elem
        )
        WHERE goals IS NOT NULL;
    """)



def downgrade() -> None:
    # Convert ARRAY(TEXT) back to text (stringified JSON array)
    op.execute("""
        UPDATE userprofile
        SET goals = to_jsonb(goals)::text
        WHERE goals IS NOT NULL;
    """)

    op.alter_column(
        'userprofile',
        'goals',
        type_=sa.Text(),
        existing_type=postgresql.ARRAY(sa.String()),
        postgresql_using='goals::text'
    )
