from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# ✅ Add project root to path for clean imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# ✅ Import Base and engine from your db setup
from backend.db import Base, engine

# ✅ Import ALL models explicitly so Alembic can detect them
from backend.models.user_model import User
from backend.models.withdrawal_model import Withdrawal, Investment
from backend.models.referral_model import ReferralEarning
from backend.models.roi_model import ROIConfig
from backend.models.commission_model import CommissionConfig
# 📋 Alembic config object
config = context.config
fileConfig(config.config_file_name)

# ✅ This allows autogenerate to detect models
target_metadata = Base.metadata

# --- OFFLINE MIGRATIONS ---
def run_migrations_offline():
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()

# --- ONLINE MIGRATIONS ---
def run_migrations_online():
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

# ✅ Run appropriate migration mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
