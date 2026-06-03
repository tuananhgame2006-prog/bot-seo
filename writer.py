# -*- coding: utf-8 -*-
import db
import datetime

def run_writer_agent():
    db.add_log("Writer", "Running Python Writer Agent content generation", "info")
    state = db._load_db()
    
    pending_kws = [k for k in state.get("keywords", []) if k.get("status") == "pending"]
    if not pending_kws:
        db.add_log("Writer", "Aborted: No pending keywords to write drafts for.", "warning")
        return
    
    target_kw = pending_kws[0]
    target_kw["status"] = "drafted"
    
    t = int(datetime.datetime.now().timestamp())
    title = f"Hướng Dẫn Tối Ưu Hóa {target_kw['keyword'].title()} Đạt Hiệu Quả Tối Đa"
    new_draft = {
        "id": f"draft-py-writer-{t}",
        "keyword": target_kw["keyword"],
        "title": title,
        "outline": [
            "1. Tổng quan về xu hướng",
            "2. Chiến lược phân tích từ khóa gốc",
            "3. Công cụ tối ưu hóa tự động hóa bằng AI",
            "4. Kết luận chiến dịch"
        ],
        "draftHtml": f"<div class=\"p-6 bg-slate-900 border border-purple-500 rounded-xl font-sans\" style=\"color: #cbd5e1;\">\n  <header class=\"mb-6\">\n    <h1 class=\"text-2xl font-black text-white\">{title}</h1>\n    <p class=\"text-xs text-slate-400 mt-1\">Tạo bởi Writer Agent Python</p>\n  </header>\n  <section class=\"mb-4\">\n    <p>Giải pháp tối ưu hóa tối thượng cho <strong>{target_kw['keyword']}</strong> với sự đồng hành của thuật toán thông minh.</p>\n  </section>\n</div>",
        "seoScore": 0,
        "reviewerNotes": "",
        "status": "pending",
        "approvalStatus": "pending",
        "editorFeedback": "",
        "scheduledDate": (datetime.date.today() + datetime.timedelta(days=3)).isoformat(),
        "assignedAgent": "Gemini-3.5-Flash",
        "attributes": {
            "readability": 0,
            "keywordDensity": 0,
            "wordCountScore": 0,
            "structure": 0,
            "metadata": 0,
            "backlinkPotential": 0
        }
    }
    state.setdefault("drafts", []).append(new_draft)
    db._save_db(state)
    db.add_log("Writer", f"Successfully drafted content for: '{target_kw['keyword']}'", "success")
