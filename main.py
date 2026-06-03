# -*- coding: utf-8 -*-
"""
SEO Swarm Commander - CLI Controller
===================================
Run from the terminal or console:
  $ python main.py scout "<topic>"
  $ python main.py write
  $ python main.py review
  $ python main.py publish
  $ python main.py track
"""
import sys
import scout
import writer
import reviewer
import publisher
import tracker
import db

def print_help():
    print("""
    SEO Swarm CLI Commands:
    -----------------------
    python main.py scout <topic>   Discover keyword clusters
    python main.py write           Compile rich draft structures
    python main.py review          Execute audit checklists
    python main.py publish         Graduate approved content to published
    python main.py track           Forecast visibility impressions
    """)

def main():
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)
        
    cmd = sys.argv[1].lower()
    
    if cmd == "scout":
        topic = sys.argv[2] if len(sys.argv) > 2 else "tự động hóa nội dung"
        scout.run_scout_agent(topic)
    elif cmd == "write":
        writer.run_writer_agent()
    elif cmd == "review":
        reviewer.run_reviewer_agent()
    elif cmd == "publish":
        # Multi-role safe check
        state = db._load_db()
        approved_drafts = [d for d in state.get("drafts", []) if d.get("approvalStatus") == "approved" and d.get("status") != "published"]
        if not approved_drafts:
            print("WARNING: Quyền đăng tin tức và tài liệu nền tảng chỉ dành cho quản trị viên.")
            print("Cần có phê duyệt từ Ban Biên Tập / Sếp ('Đồng ý'). Không tìm thấy bản thảo được duyệt.")
            sys.exit(1)
        
        publisher.run_publisher_agent()
    elif cmd == "track":
        tracker.run_tracker_agent()
    else:
        print(f"Unknown command: {cmd}")
        print_help()

if __name__ == "__main__":
    main()
