from datetime import date

def get_roi_status(investment, config):
    """
    Calculate ROI progress for a single investment.
    Returns dict with capital, received ROI, max return, and progress %.
    """

    # Capital invested
    capital = investment.amount

    # Max return (2x model, configurable from ROIConfig)
    multiplier = getattr(config, "max_roi_multiplier", 2.0)
    max_return = capital * multiplier

    # ROI received so far = wallet_balance earned from this investment
    # If you track per-investment earnings separately, adjust here.
    roi_received = getattr(investment, "roi_received", 0.0)

    # Progress %
    progress_percent = (roi_received / max_return) * 100 if max_return > 0 else 0

    return {
        "capital": round(capital, 2),
        "roi_received": round(roi_received, 2),
        "max_return": round(max_return, 2),
        "progress_percent": round(progress_percent, 2),
        "timestamp": investment.timestamp
    }
