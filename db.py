# -*- coding: utf-8 -*-
"""
Python SQLite-mock database layer mapping to /E_drive/seo_midterm.db
"""
import os
import json

DB_FILE = os.path.join(os.getcwd(), 'E_drive', 'seo_midterm.db')

def _load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"keywords": [], "drafts": [], "published": [], "trajectory": [], "logs": []}

def _save_db(state):
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def get_pipeline_metrics():
    state = _load_db()
    kw_count = len(state.get("keywords", []))
    pending_drafts = len([d for d in state.get("drafts", []) if d.get("status") != "published"])
    posts_published = len(state.get("published", []))
    
    drafts_with_score = [d for d in state.get("drafts", []) if d.get("seoScore", 0) > 0]
    avg_score = round(sum(d.get("seoScore", 0) for d in drafts_with_score) / len(drafts_with_score)) if drafts_with_score else 0
    
    return {
        "keywordsFound": kw_count,
        "draftsPending": pending_drafts,
        "postsPublished": posts_published,
        "averageSeoScore": avg_score
    }

def get_keywords():
    return _load_db().get("keywords", [])

def get_all_keywords():
    return get_keywords()

def get_articles():
    return _load_db().get("drafts", [])

def get_drafts():
    return get_articles()

def get_trajectory():
    return _load_db().get("trajectory", [])

def get_rankings():
    return get_trajectory()

def add_log(agent, message, log_type="info"):
    import datetime
    state = _load_db()
    log_entry = {
        "id": f"log-py-{int(datetime.datetime.now().timestamp())}",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "agent": agent,
        "message": message,
        "type": log_type
    }
    state.setdefault("logs", []).append(log_entry)
    _save_db(state)
    print(f"[{agent.upper()}] {message}")
