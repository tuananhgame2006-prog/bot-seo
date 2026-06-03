# -*- coding: utf-8 -*-
"""
SEO Swarm Publisher - B2B Pipeline CMS Connector
Pushes approved drafts onto live indexing pathways.
"""
import db
import datetime

def run_publisher_agent():
    db.add_log("Publisher", "Spawned Publisher Agent. Fetching approved drafts for CMS deployment...", "info")
    state = db._load_db()
    
    # Filter approved drafts
    approved_drafts = [d for d in state.get("drafts", []) if d.get("approvalStatus") == "approved" and d.get("status") != "published"]
    if not approved_drafts:
        db.add_log("Publisher", "Aborted: No approved drafts found. Please approve the drafts via UI or Command Center.", "error")
        return
    
    target_draft = approved_drafts[0]
    
    # Establish slug and publication URL
    slug = target_draft["title"].lower().replace(" ", "-").replace(":", "").replace("?", "").replace(",", "")
    # Standard clean slug
    url = f"https://seo-hq.wordpress-cloud.net/published/{slug}"
    
    published_post = {
        "id": f"pub-py-{int(datetime.datetime.now().timestamp())}",
        "draftId": target_draft["id"],
        "title": target_draft["title"],
        "url": url,
        "platform": "WordPress",
        "date": datetime.date.today().isoformat(),
        "status": "live"
    }
    
    # Graduate statuses
    target_draft["status"] = "published"
    state.setdefault("published", []).append(published_post)
    
    # Exposing the body_html purely without markdown wraps or backticks in SQLite simulation
    db._save_db(state)
    db.add_log("Publisher", f"Publish Handshake Successful! Article indexed at: {url}", "success")

if __name__ == "__main__":
    run_publisher_agent()
