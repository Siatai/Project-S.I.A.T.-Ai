from logging.config import fileConfig
import sys
import os

from sqlalchemy import engine_from_config, pool
from alembic import context

# --- Add backend folder to sys.path ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your Base and DB URL
from db import Base, DATABASE_URL

# Import all models so Alembic sees them
from models import user_model, commission_model, referral_model, roi_model, withdrawal_model, associate_config_model, DirectReferralBonus
# (user_logic.py is not a model, so skip it)

# Alembic Config object, provides access to .ini values
config = context.config

# Override DB URL from db.py (instead of alembic.ini only)
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Logging setup
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Point Alembic to your models
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
