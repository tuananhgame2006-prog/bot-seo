# -*- coding: utf-8 -*-
import db
import datetime
import random

def run_tracker_agent():
    db.add_log("Tracker", "Running Python Tracker Agent: Simulating organic search trajectory curves...", "info")
    state = db._load_db()
    
    published_count = len(state.get("published", []))
    if published_count == 0:
        db.add_log("Tracker", "Aborted: Tracker requires at least 1 live published article to project SEO metrics.", "warning")
        return
    
    # Generate simulated curve
    curve = []
    base_date = datetime.date.today() - datetime.timedelta(days=30)
    for i in range(31):
        d = base_date + datetime.timedelta(days=i)
        impressions = int(i * i * 15 + i * 110 + 20)
        clicks = int(i * i * 0.8 + i * 2 + 1)
        position = float(max(2.1, round(85.0 - i * 2.6 - random.uniform(-1, 1), 1)))
        
        curve.append({
            "date": d.isoformat(),
            "impressions": impressions,
            "clicks": clicks,
            "position": position
        })
    
    state["trajectory"] = curve
    db._save_db(state)
    db.add_log("Tracker", f"Chronological curve modeled. Total projected GSC impressions: {impressions}", "success")
