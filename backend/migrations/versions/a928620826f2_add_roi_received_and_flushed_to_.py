"""add roi_received and flushed to investments

Revision ID: a928620826f2
Revises: 50713b398775
Create Date: 2025-09-11 23:47:29.050326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a928620826f2'
down_revision: Union[str, None] = '50713b398775'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
