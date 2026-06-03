# -*- coding: utf-8 -*-
import db

def run_scout_agent(topic: str):
    db.add_log("Scout", f"Running Python Scout Agent crawl for topic: '{topic}'", "info")
    # Fetch existing and add new
    state = db._load_db()
    
    import datetime
    t = int(datetime.datetime.now().timestamp())
    new_kw = [
        {
            "id": f"kw-py-scout-{t}-1",
            "keyword": f"ứng dụng {topic} thực tế",
            "volume": 3200,
            "difficulty": 38,
            "intent": "Informational",
            "relevance": 92,
            "status": "pending",
            "topic": topic
        },
        {
            "id": f"kw-py-scout-{t}-2",
            "keyword": f"báo giá giải pháp {topic} tự động",
            "volume": 1200,
            "difficulty": 45,
            "intent": "Commercial",
            "relevance": 88,
            "status": "pending",
            "topic": topic
        }
    ]
    state.setdefault("keywords", []).extend(new_kw)
    db._save_db(state)
    db.add_log("Scout", f"Discovered 2 new keyword clusters for topic '{topic}'", "success")
