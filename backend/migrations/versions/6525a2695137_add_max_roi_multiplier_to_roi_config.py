"""add associate fields to investments

Revision ID: 6525a2695137
Revises: 23f529eed43b
Create Date: 2025-09-15 18:58:45.706169
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6525a2695137'
down_revision: Union[str, None] = '23f529eed43b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # --- Add new fields to investments safely ---
    op.add_column(
        'investments',
        sa.Column('is_associate', sa.Boolean(), nullable=False, server_default=sa.text("false"))
    )
    op.add_column('investments', sa.Column('source_investor', sa.String(), nullable=True))
    op.add_column('investments', sa.Column('lock_days', sa.Integer(), nullable=True))
    op.add_column('investments', sa.Column('matured_at', sa.DateTime(), nullable=True))

    # Ensure user_email stays NOT NULL
    op.alter_column(
        'investments', 'user_email',
        existing_type=sa.VARCHAR(),
        nullable=False
    )

    # FK for source_investor → users.email
    op.create_foreign_key(
        'fk_investments_source_investor_users',
        'investments', 'users',
        ['source_investor'], ['email']
    )

    # Drop server default after backfilling so ORM default takes over
    op.alter_column('investments', 'is_associate', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""

    # Drop FK first
    op.drop_constraint('fk_investments_source_investor_users', 'investments', type_='foreignkey')

    # Revert user_email nullability
    op.alter_column(
        'investments', 'user_email',
        existing_type=sa.VARCHAR(),
        nullable=True
    )

    # Drop associate fields
    op.drop_column('investments', 'matured_at')
    op.drop_column('investments', 'lock_days')
    op.drop_column('investments', 'source_investor')
    op.drop_column('investments', 'is_associate')
