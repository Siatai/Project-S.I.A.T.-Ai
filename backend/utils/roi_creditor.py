from datetime import datetime
from sqlalchemy.orm import Session

from backend.models.roi_model import ROIConfig
from backend.models.withdrawal_model import Investment
from backend.models.user_model import User


def credit_daily_roi(db: Session):
    """
    Credit daily ROI to all users' wallet_balance.
    - ROI % monthly from ROIConfig
    - Daily split = monthly% / 22
    - Credits only Mon–Fri
    """

    today = datetime.utcnow()
    if today.weekday() >= 5:  # Sat=5, Sun=6
        return {"message": "Weekend - no ROI credited"}

    roi = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    percentage = roi.percentage if roi else 0.0
    if percentage <= 0:
        return {"message": "No ROI config set"}

    daily_percentage = percentage / 22  # working days in a month

    users = db.query(User).all()
    credited = []

    for user in users:
        investments = db.query(Investment).filter_by(user_email=user.email).all()
        invested_amount = sum(inv.amount for inv in investments)

        if invested_amount > 0:
            daily_earning = invested_amount * (daily_percentage / 100)
            daily_earning = round(daily_earning, 2)

            user.wallet_balance += daily_earning
            credited.append({
                "email": user.email,
                "invested": invested_amount,
                "credited": daily_earning,
                "new_balance": user.wallet_balance
            })

    db.commit()
    return {"message": f"Credited ROI to {len(credited)} users", "details": credited}
