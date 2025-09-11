# utils/roi_tracker.py
def get_roi_status(investment, config):
    max_return = investment.amount * config.max_roi_multiplier
    roi_received = investment.roi_received if hasattr(investment, "roi_received") else 0
    left_to_receive = max_return - roi_received
    if left_to_receive < 0:
        left_to_receive = 0

    return {
        "capital": investment.amount,
        "roi_received": roi_received,
        "max_return": max_return,
        "left_to_receive": left_to_receive,
        "flushed": left_to_receive == 0,
    }
