def get_roi_status(investment, config):
    # Always force safe floats
    capital = float(investment.amount or 0)
    roi_received = float(getattr(investment, "roi_received", 0) or 0)
    multiplier = float(getattr(config, "max_roi_multiplier", None) or 2.0)  # default 2x if missing

    # Calculate
    max_return = capital * multiplier
    left_to_receive = max_return - roi_received
    flushed = left_to_receive <= 0

    progress_percent = (roi_received / max_return * 100) if max_return > 0 else 0

    return {
        "capital": round(capital, 2),
        "roi_received": round(roi_received, 2),
        "max_return": round(max_return, 2),
        "left_to_receive": round(max(0, left_to_receive), 2),
        "flushed": flushed,
        "progress_percent": round(progress_percent, 2),
    }
