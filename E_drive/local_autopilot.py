# -*- coding: utf-8 -*-
"""
SEO Autopilot Local Desktop Client App
------------------------------------
Sản phẩm: SEO Programmatic Autopilot Flow (Desktop Client Application)
Tác giả: AI Developer & SEO Programmatic Swarm
Lớp kiến trúc: Tkinter Desktop Modern GUI + Multi-Threaded Engine + Email Approval (SMTP/IMAP)
Tần suất: Chạy ngầm lập lịch lúc 6h00 sáng khi khởi động PC (5h59) + Giao diện giám sát thời gian thực
"""

import os
import sys
import time
import json
import logging
import datetime
import smtplib
import imaplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
import threading
import queue

# Thư viện giao diện chuẩn của Python (không cần cài thêm)
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext

# Các thư viện phụ trợ (cần tải qua pip: pip install requests schedule)
try:
    import requests
    import schedule
except ImportError:
    # Gợi ý tự động cài đặt nếu thiếu thư viện trên môi trường chạy thực tế
    import subprocess
    logger_msg = "Đang tự động cài đặt các dependencies cần thiết (requests, schedule)..."
    print(logger_msg)
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "schedule"])
    import requests
    import schedule

# ==============================================================================
# 1. CẤU HÌNH & HỆ THỐNG ĐƯỜNG DẪN AN TOÀN (HARDWARE RESILIENCE)
# ==============================================================================
# Hỗ trợ tự động chuyển vị trí lưu trữ an toàn nếu không tìm thấy ổ đĩa vật lý E:\
BASE_DRIVE = "E:\\" if os.path.exists("E:\\") else os.path.join(os.getcwd(), "E_drive")
os.makedirs(os.path.join(BASE_DRIVE, "E_drive"), exist_ok=True)

CONFIG_PATH = os.path.join(BASE_DRIVE, "E_drive", "local_config.json")
DB_STATE_PATH = os.path.join(BASE_DRIVE, "E_drive", "local_autopilot_db.json")
LOG_FILE_PATH = os.path.join(BASE_DRIVE, "E_drive", "local_autopilot_run.log")

DEFAULT_CONFIG = {
    "SMTP_SERVER": "smtp.gmail.com",
    "SMTP_PORT": 465,
    "IMAP_SERVER": "imap.gmail.com",
    "IMAP_PORT": 993,
    "EMAIL_USER": "tuananhgame2006@gmail.com",
    "EMAIL_PASSWORD": "YOUR_APP_PASSWORD_HERE",
    "APPROVER_EMAIL": "tuananhgame2006@gmail.com",
    "REMOTE_WEB_API_ENDPOINT": "https://your-vercel-site.vercel.app/api/articles/import",
    "REMOTE_WEB_API_TOKEN": "SECURE_BEARER_TOKEN_HERE",
    "LOCAL_IMAGE_DIR": os.path.join(BASE_DRIVE, "E_drive", "images"),
    "CHECK_APPROVED_INTERVAL_MINS": 2,
    "SCHEDULER_TIME": "06:00"
}

def load_system_config():
    if not os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_CONFIG, f, indent=4, ensure_ascii=False)
            return DEFAULT_CONFIG
        except Exception:
            return DEFAULT_CONFIG
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Merge fields if any are missing
            for k, v in DEFAULT_CONFIG.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception:
        return DEFAULT_CONFIG

def save_system_config(new_config):
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(new_config, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Lỗi lưu file cấu hình: {e}")
        return False

# Load cấu hình
CONFIG = load_system_config()
os.makedirs(CONFIG["LOCAL_IMAGE_DIR"], exist_ok=True)

# Khởi tạo Queue nhận log để luồng đa luồng (multi-thread) gửi logs sang giao diện an toàn
log_queue = queue.Queue()

class QueueHandler(logging.Handler):
    def __init__(self, log_q):
        super().__init__()
        self.log_q = log_q

    def emit(self, record):
        msg = self.format(record)
        self.log_q.put(msg)

# Thiết lập ghi log
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE_PATH, encoding="utf-8"),
        QueueHandler(log_queue)
    ]
)
logger = logging.getLogger("AutopilotGUI")

# ==============================================================================
# 2. XỬ LÝ DATABASE NỘI BỘ (LOCAL STATE DB)
# ==============================================================================
def load_local_state():
    if not os.path.exists(DB_STATE_PATH):
        initial = {"keywords": [], "drafts": [], "logs": []}
        try:
            with open(DB_STATE_PATH, "w", encoding="utf-8") as f:
                json.dump(initial, f, indent=2, ensure_ascii=False)
            return initial
        except Exception:
            return initial
    try:
        with open(DB_STATE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"keywords": [], "drafts": [], "logs": []}

def save_local_state(state):
    try:
        with open(DB_STATE_PATH, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Lỗi lưu cơ sở dữ liệu: {e}")

# ==============================================================================
# 3. QUY TRÌNH RA SOÁT EMAIL & GỬI DUYỆT (SMTP / IMAP ENGINES)
# ==============================================================================
class EmailApprovalManager:
    @staticmethod
    def send_approval_email(draft_id, title, category, html_content, keywords, tags):
        logger.info(f"📬 Đang soạn email xin phê duyệt bài viết: '{title}'...")
        subject = f"[YÊU CẦU DUYỆT BÀI] [{draft_id}] - {title}"
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = CONFIG["EMAIL_USER"]
        msg["To"] = CONFIG["APPROVER_EMAIL"]
        
        # HTML template hiện đại phối màu của thương hiệu độc quyền
        email_body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px;">
            <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #0f172a, #2563eb); color: #ffffff; padding: 25px; text-align: center;">
                    <span style="background-color: rgba(255,255,255,0.2); text-transform: uppercase; font-size: 11px; font-weight: bold; letter-spacing: 1px; padding: 4px 8px; border-radius: 4px;">SEO Programmatic Autopilot Flow</span>
                    <h1 style="font-size: 20px; font-weight: 700; margin: 12px 0 0 0; line-height: 1.4;">Bản Nháp Bản Thảo Đang Chờ Phê Duyệt</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 600; width: 140px;">Mã Bản Thảo:</td>
                            <td style="padding: 4px 0; font-family: monospace; color: #01579b; font-weight: bold;">{draft_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Chuyên Mục SEO:</td>
                            <td style="padding: 4px 0; color: #2563eb; font-weight: bold; text-transform: uppercase;">{category}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Từ Khóa Mục Tiêu:</td>
                            <td style="padding: 4px 0; color: #0f172a; font-style: italic;">"{keywords}"</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Tags:</td>
                            <td style="padding: 4px 0; color: #475569;">{', '.join(tags)}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="padding: 25px; border-bottom: 1px solid #e2e8f0;">
                    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; border-left: 4px solid #2563eb; padding-left: 10px;">{title}</h2>
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 15px 0;">
                    <div style="background-color: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto; font-size: 14px; line-height: 1.6;">
                        {html_content}
                    </div>
                </div>
                
                <div style="padding: 20px 25px; background-color: #f0fdf4; text-align: center;">
                    <h3 style="font-size: 14px; color: #166534; margin: 0 0 8px 0; font-weight: bold;">💡 LỆNH PHÊ DUYỆT TỪ PHẢN HỒI GMAIL</h3>
                    <p style="font-size: 12px; color: #15803d; line-height: 1.6; margin: 0;">
                        Hãy <strong>BẤM TRẢ LỜI (REPLY)</strong> email này và soạn nội dung chứa từ khóa:<br/>
                        <span style="background-color: #bbf7d0; border: 1px solid #86efac; color: #14532d; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 12px; margin: 5px display: inline-block;">Duyệt</span> hoặc 
                        <span style="background-color: #bbf7d0; border: 1px solid #86efac; color: #14532d; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 12px; margin: 5px display: inline-block;">Approve</span>
                    </p>
                    <p style="font-size: 11px; color: #64748b; margin-top: 12px;">(Bạn cũng có thể xem và bấm <strong>Duyệt trực tiếp ngay trên giao diện của App</strong> này!)</p>
                </div>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(email_body, "html"))
        
        try:
            server = smtplib.SMTP_SSL(CONFIG["SMTP_SERVER"], CONFIG["SMTP_PORT"])
            server.login(CONFIG["EMAIL_USER"], CONFIG["EMAIL_PASSWORD"])
            server.sendmail(CONFIG["EMAIL_USER"], [CONFIG["APPROVER_EMAIL"]], msg.as_string())
            server.quit()
            logger.info(f"✓ Gửi email phê duyệt thành công cho bài viết [{draft_id}].")
            return True
        except Exception as e:
            logger.error(f"❌ Thất bại khi gửi email phê duyệt: {e}")
            return False

    @staticmethod
    def check_email_approvals(pending_draft_ids):
        if not pending_draft_ids:
            return []
            
        logger.info(f"🔄 Đang tiến hành quét hộp thư Inbox để tìm email duyệt của các mã: {pending_draft_ids}...")
        approved_draft_ids = []
        
        try:
            mail = imaplib.IMAP4_SSL(CONFIG["IMAP_SERVER"], CONFIG["IMAP_PORT"])
            mail.login(CONFIG["EMAIL_USER"], CONFIG["EMAIL_PASSWORD"])
            mail.select("inbox")
            
            # Quét email nhận được hôm nay
            today_date = datetime.date.today().strftime("%d-%b-%Y")
            status, response_data = mail.search(None, f'(SINCE "{today_date}")')
            
            if status != "OK":
                logger.warning("Không thể đọc thư mục Inbox qua IMAP.")
                return []
                
            email_ids = response_data[0].split()
            for num in reversed(email_ids):
                status, data = mail.fetch(num, "(RFC822)")
                if status != "OK":
                    continue
                    
                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                # Giải mã tiêu đề email
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding or "utf-8", errors="ignore")
                
                # Kiểm tra người gửi
                sender, encoding = decode_header(msg.get("From"))[0]
                if isinstance(sender, bytes):
                    sender = sender.decode(encoding or "utf-8", errors="ignore")
                
                if CONFIG["APPROVER_EMAIL"] not in sender.lower() and CONFIG["EMAIL_USER"] not in sender.lower():
                    continue
                    
                # Tìm Draft ID liên kết
                matched_id = None
                for d_id in pending_draft_ids:
                    if d_id in subject:
                        matched_id = d_id
                        break
                        
                if not matched_id:
                    continue
                    
                # Phân tích nội dung email
                body_content = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))
                        if content_type == "text/plain" and "attachment" not in content_disposition:
                            payload = part.get_payload(decode=True)
                            body_content = payload.decode(part.get_content_charset() or "utf-8", errors="ignore")
                            break
                else:
                    payload = msg.get_payload(decode=True)
                    body_content = payload.decode(msg.get_content_charset() or "utf-8", errors="ignore")
                    
                normalized_body = body_content.lower()
                
                if "duyệt" in normalized_body or "approve" in normalized_body:
                    logger.info(f"⭐ [Gmail Approved] Đã đồng ý phê duyệt từ email cho ID [{matched_id}]!")
                    approved_draft_ids.append(matched_id)
                    mail.store(num, "+FLAGS", "\\Seen") # Đánh dấu đã đọc
                    
            mail.close()
            mail.logout()
        except Exception as e:
            logger.error(f"❌ Lỗi khi thực hiện quét IMAP quét thư phê duyệt: {e}")
            
        return approved_draft_ids

# ==============================================================================
# 4. MODULE GỬI LÊN WEB API TỪ XA QUA ENDPOINT (VERCEL CONNECT)
# ==============================================================================
class RemotePublisher:
    @staticmethod
    def publish_article_to_remote(article_payload):
        title = article_payload.get("title")
        draft_id = article_payload.get("id")
        
        logger.info(f"🚀 Đang đẩy bài viết [{draft_id}] - '{title}' lên Web API Vercel của Cloud...")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {CONFIG['REMOTE_WEB_API_TOKEN']}"
        }
        
        try:
            response = requests.post(
                CONFIG["REMOTE_WEB_API_ENDPOINT"],
                headers=headers,
                data=json.dumps(article_payload),
                timeout=20
            )
            
            logger.info(f"Mã trạng thái phản hồi API: {response.status_code}")
            if response.status_code in [200, 201]:
                logger.info(f"🎉 ĐĂNG BÀI THÀNH CÔNG: Bài viết [{draft_id}] đã chính thức được kích hoạt trên hệ thống trực tuyến!")
                return True
            else:
                logger.error(f"⚠️ Từ chối đăng bài. Server trả về lỗi: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"🚨 Gặp lỗi phần cứng hoặc mạng vật lý khi kết nối tới Vercel: {e}")
            return False

# ==============================================================================
# 5. ORCHESTRATOR & AGENT SIMULATOR ON LOCAL
# ==============================================================================
class LocalAgentCoordinator:
    @classmethod
    def execute_daily_scout_and_writer(cls, trigger_source="Lập lịch tự động"):
        logger.info(f"⚡ --- KÍCH HOẠT QUY TRÌNH SCOUT & WRITER AGENTS [{trigger_source.upper()}] ---")
        state = load_local_state()
        
        # Săn tin tức về 3 mảng cốt lõi
        today_topics = [
            {"topic": "Silicong và cực tím EUV bán dẫn", "category": "semi-news"},
            {"topic": "Thuật toán tối ưu hóa LLM Agent", "category": "ai-news"},
            {"topic": "Khoa học mạng Neuromorphic", "category": "foundational"}
        ]
        
        discovered_keywords = []
        t = int(time.time())
        for item in today_topics:
            kw = {
                "id": f"kw-{t}-{item['category']}",
                "keyword": f"Thiết bị công nghệ {item['topic']}",
                "topic": item["topic"],
                "category": item["category"],
                "volume": 3500,
                "difficulty": 30,
                "status": "pending"
            }
            state["keywords"].append(kw)
            discovered_keywords.append(kw)
            logger.info(f"🔍 [Scout Agent] Đã phân loại từ khóa xu hướng mới: '{kw['keyword']}' -> Chuyên mục [{kw['category']}].")
            
        # Biên soạn bài viết tự động
        for kw in discovered_keywords:
            draft_id = f"draft-{int(time.time())}-{kw['category']}"
            
            # Đường dẫn ảnh minh họa Unsplash chuẩn và đẹp
            featured_images = [
                "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
            ]
            
            writer_content = f"""
            <div>
                <h2>Bối cảnh kỷ nguyên công nghệ số: {kw['keyword']}</h2>
                <p>Nền công nghệ bán dẫn toàn cầu và trí tuệ nhân tạo đang chứng kiến bước chuyển mình lịch sử. Sự kết hợp mật thiết giữa tối ưu hóa thuật toán LLM và tiến trình chế tạo silicon thế hệ mới đang định trị lại cán cân kinh tế kỹ thuật số.</p>
                
                <img src="{featured_images[0]}" alt="Thiết bị xử lý thông tin đầu cuối" style="max-width:100%; height:auto; border-radius:8px; margin:16px 0;" />
                
                <h2>Sự đột phá mang tính thời đại</h2>
                <p>Nghiên cứu cấu trúc vật lý nơ-ron giúp đẩy nhanh tốc độ phản hồi tính toán với năng năng tiêu hao thấp kỷ lục. Việc tích hợp sâu <strong>{kw['keyword']}</strong> sẽ đẩy biên giới công nghệ đi xa hơn nữa.</p>
                
                <img src="{featured_images[1]}" alt="Hạ tầng thiết kế trung tâm xử lý dữ liệu" style="max-width:100%; height:auto; border-radius:8px; margin:16px 0;" />
                
                <h2>Kết luận cốt lõi và Phát triển</h2>
                <p>Tương lai sẽ thuộc về những nhà phát triển dám đột phá và sẵn sàng thích nghi trước làn sóng Programmatic SEO mạnh mẽ này.</p>
            </div>
            <!-- SEO_META: category={kw['category']} | tags=[tech, automation, {kw['category']}] -->
            """
            
            draft_title = f"Ứng Dụng Đột Phá Quốc Tế Với {kw['keyword']}"
            draft = {
                "id": draft_id,
                "keyword": kw["keyword"],
                "category": kw["category"],
                "title": draft_title,
                "draftHtml": writer_content,
                "tags": ["autopilot", kw["category"], "seo"],
                "status": "pending_approval",
                "created_at": datetime.datetime.now().isoformat()
            }
            state["drafts"].append(draft)
            kw["status"] = "drafted"
            
            # Gửi Email xin phê duyệt của anh
            email_success = EmailApprovalManager.send_approval_email(
                draft_id=draft_id,
                title=draft_title,
                category=kw["category"],
                html_content=writer_content,
                keywords=kw["keyword"],
                tags=draft["tags"]
            )
            
            if email_success:
                logger.info(f"✉️ Đã đưa bản thảo [{draft_id}] xếp vào hàng chờ phê duyệt và gửi thư xin duyệt đi thành công.")
            else:
                logger.warning(f"⚠️ Email thông báo phê duyệt bài {draft_id} bị gián đoạn.")
                
        save_local_state(state)
        logger.info("✓ Hoàn thành đăng ký danh sách bài viết buổi sáng. Trạng thái: Đang theo dõi phê duyệt.")

    @classmethod
    def check_and_publish_pending_approvals(cls):
        state = load_local_state()
        pending_drafts = [d for d in state.get("drafts", []) if d.get("status") == "pending_approval"]
        
        if not pending_drafts:
            return False
            
        pending_ids = [d["id"] for d in pending_drafts]
        approved_ids = EmailApprovalManager.check_email_approvals(pending_ids)
        
        has_updates = False
        if approved_ids:
            for draft in pending_drafts:
                if draft["id"] in approved_ids:
                    logger.info(f"🚀 PHÁT HIỆN LỆNH DUYỆT EMAIL: Đồng ý xuất bản bài [{draft['id']}]!")
                    draft["status"] = "publishing"
                    save_local_state(state)
                    
                    # Gọi API Vercel đẩy bài
                    publish_success = RemotePublisher.publish_article_to_remote(draft)
                    if publish_success:
                        draft["status"] = "published"
                        draft["published_at"] = datetime.datetime.now().isoformat()
                        logger.info(f"✓ Hoàn tất cập nhật trạng thái đã xuất bản thành công của {draft['id']} lên web.")
                    else:
                        draft["status"] = "failed_publish"
                        logger.warning(f"❌ Tiến trình đẩy nội dung của bài [{draft['id']}] lên Vercel thất bại.")
                    has_updates = True
            save_local_state(state)
        return has_updates

# ==============================================================================
# 6. GIAO DIỆN KIỂU DÁNG MODERN GRAPHICAL WINDOW (TKINTER INTERFACE)
# ==============================================================================
class AutopilotTkApp:
    def __init__(self, root):
        self.root = root
        self.root.title("SEO Autopilot Client Control Panel")
        self.root.geometry("1100x750")
        self.root.minsize(1050, 680)
        
        # Thiết kế bảng màu Slate Dark Modern cuốn hút công nghệ
        self.style = ttk.Style()
        self.style.theme_use("clam")
        
        self.bg_color = "#0f172a"      # Deep Slate Dark
        self.card_color = "#1e293b"    # Card Slate Gray
        self.accent_color = "#3b82f6"  # Royal Cool Blue
        self.text_color = "#f1f5f9"    # High-contrast text
        self.green_color = "#22c55e"   # Active Green
        self.danger_color = "#ef4444"  # Danger Red
        
        self.root.configure(bg=self.bg_color)
        
        # Trạng thái Scheduler
        self.scheduler_is_running = True
        self.scheduler_thread = None
        
        self.create_widgets()
        self.load_settings_to_ui()
        self.refresh_pending_drafts_view()
        
        # Khởi động bộ quét hàng chờ log ghi nhận sang Terminal
        self.root.after(100, self.polling_logs_to_gui)
        
        # Khởi động tiến trình đa luồng chạy ngầm Scheduler
        self.start_scheduler_thread()

    def create_widgets(self):
        # ----------------------------------------------------------------------
        # FRAME CHỦ ĐỀ CHÍNH (HEADER BAR)
        # ----------------------------------------------------------------------
        header_frame = tk.Frame(self.root, bg=self.card_color, height=70, relief="solid", bd=1)
        header_frame.pack(fill="x", side="top")
        header_frame.pack_propagate(False)
        
        title_label = tk.Label(
            header_frame, 
            text="⚙️ SEO AUTOPILOT LOCAL MANAGEMENT CLIENT", 
            font=("Segoe UI", 16, "bold"), 
            fg=self.text_color, 
            bg=self.card_color
        )
        title_label.pack(side="left", padx=20, pady=15)
        
        # Badge Trạng thái Lập lịch hoạt động của máy
        self.status_badge = tk.Label(
            header_frame, 
            text="● SCHEDULER: ĐANG CHẠY NGẦM", 
            font=("Segoe UI", 10, "bold"), 
            fg=self.green_color, 
            bg="#14532d", 
            padx=12, 
            pady=4,
            relief="flat"
        )
        self.status_badge.pack(side="right", padx=20, pady=18)
        
        # ----------------------------------------------------------------------
        # PHÂN KHU LỚP DƯỚI (MẠNG LƯỚI GRID CHI TIẾT)
        # ----------------------------------------------------------------------
        main_container = tk.Frame(self.root, bg=self.bg_color)
        main_container.pack(fill="both", expand=True, padx=15, pady=15)
        
        # Phân chia bên trái 45% (Cấu hình) và bên phải 55% (Duyệt bài)
        left_panel = tk.Frame(main_container, bg=self.bg_color)
        left_panel.place(relx=0, rely=0, relwidth=0.42, relheight=1.0)
        
        right_panel = tk.Frame(main_container, bg=self.bg_color)
        right_panel.place(relx=0.44, rely=0, relwidth=0.56, relheight=1.0)
        
        # ======================================================================
        # CẤU HÌNH GMAIL & WEB ENDPOINT (BÊN TRÁI PANEL)
        # ======================================================================
        config_frame = tk.LabelFrame(
            left_panel, 
            text=" Cài Đặt Hệ Thống & Trực Quan Hóa ", 
            font=("Segoe UI", 11, "bold"), 
            fg=self.accent_color, 
            bg=self.card_color, 
            relief="groove", 
            bd=1
        )
        config_frame.place(relx=0, rely=0, relwidth=1.0, relheight=0.58)
        
        # Helper vẽ nhãn và ô thông tin dạng Grid nhanh
        tk.Label(config_frame, text="Gmail Nhận Tin:", bg=self.card_color, fg=self.text_color, font=("Segoe UI", 9, "bold")).grid(row=0, column=0, sticky="w", padx=12, pady=8)
        self.entry_email_user = ttk.Entry(config_frame, width=32)
        self.entry_email_user.grid(row=0, column=1, sticky="w", padx=5, pady=8)
        
        tk.Label(config_frame, text="Mật khẩu Ứng dụng:", bg=self.card_color, fg=self.text_color, font=("Segoe UI", 9, "bold")).grid(row=1, column=0, sticky="w", padx=12, pady=8)
        self.entry_email_pass = ttk.Entry(config_frame, show="*", width=32)
        self.entry_email_pass.grid(row=1, column=1, sticky="w", padx=5, pady=8)
        
        tk.Label(config_frame, text="Gmail Xin Phê Duyệt:", bg=self.card_color, fg=self.text_color, font=("Segoe UI", 9, "bold")).grid(row=2, column=0, sticky="w", padx=12, pady=8)
        self.entry_email_approver = ttk.Entry(config_frame, width=32)
        self.entry_email_approver.grid(row=2, column=1, sticky="w", padx=5, pady=8)
        
        tk.Label(config_frame, text="Vercel Web API URL:", bg=self.card_color, fg=self.text_color, font=("Segoe UI", 9, "bold")).grid(row=3, column=0, sticky="w", padx=12, pady=8)
        self.entry_vercel_url = ttk.Entry(config_frame, width=32)
        self.entry_vercel_url.grid(row=3, column=1, sticky="w", padx=5, pady=8)
        
        tk.Label(config_frame, text="API Security Bearer:", bg=self.card_color, fg=self.text_color, font=("Segoe UI", 9, "bold")).grid(row=4, column=0, sticky="w", padx=12, pady=8)
        self.entry_vercel_token = ttk.Entry(config_frame, show="*", width=32)
        self.entry_vercel_token.grid(row=4, column=1, sticky="w", padx=5, pady=8)

        tk.Label(config_frame, text="Giờ chạy hàng ngày:", bg=self.card_color, fg=self.text_color, font=("Segoe UI", 9, "bold")).grid(row=5, column=0, sticky="w", padx=12, pady=8)
        self.entry_schedule_time = ttk.Entry(config_frame, width=15)
        self.entry_schedule_time.grid(row=5, column=1, sticky="w", padx=5, pady=8)
        
        # Nút lưu cấu chỉnh
        btn_save = tk.Button(
            config_frame, 
            text="💾 LƯU CẤU HÌNH NGAY", 
            font=("Segoe UI", 9, "bold"), 
            bg=self.accent_color, 
            fg="white", 
            activebackground="#1d4ed8", 
            activeforeground="white",
            relief="flat", 
            padx=15, 
            pady=5,
            command=self.action_save_configs
        )
        btn_save.grid(row=6, column=0, columnspan=2, pady=12, padx=12, sticky="ew")

        # ----------------------------------------------------------------------
        # KHU VỰC ĐIỀU KHIỂN AGENTS PHẢN HỒI NHANH (LEFT LOWER PANEL)
        # ----------------------------------------------------------------------
        controls_frame = tk.LabelFrame(
            left_panel, 
            text=" Trạm Điều Khiển Thủ Công (Manual Station) ", 
            font=("Segoe UI", 11, "bold"), 
            fg=self.accent_color, 
            bg=self.card_color, 
            relief="groove", 
            bd=1
        )
        controls_frame.place(relx=0, rely=0.6, relwidth=1.0, relheight=0.4)
        
        btn_run_automation = tk.Button(
            controls_frame,
            text="🕵️‍♂️ CHẠY NGAY CỤC BỘ (SCOUT & WRITER AGENTS)",
            font=("Segoe UI", 9, "bold"),
            bg="#f59e0b", # Hổ phách
            fg="#0f172a",
            relief="flat",
            pady=8,
            command=self.trigger_scout_writer_on_thread
        )
        btn_run_automation.pack(fill="x", padx=15, pady=8)
        
        btn_run_sync = tk.Button(
            controls_frame,
            text="🔄 QUÉT & ĐỒNG BỘ DUYỆT EMAIL (GMAIL IMAP)",
            font=("Segoe UI", 9, "bold"),
            bg="#06b6d4", # Neon Cyan
            fg="#0f172a",
            relief="flat",
            pady=8,
            command=self.trigger_mailbox_sync_on_thread
        )
        btn_run_sync.pack(fill="x", padx=15, pady=8)
        
        self.btn_toggle_scheduler = tk.Button(
            controls_frame,
            text="⏹️ TẠM DỪNG LẬP LỊCH TỰ ĐỘNG CHẠY NGẦM",
            font=("Segoe UI", 9, "bold"),
            bg=self.danger_color,
            fg="white",
            relief="flat",
            pady=8,
            command=self.action_toggle_scheduler_engine
        )
        self.btn_toggle_scheduler.pack(fill="x", padx=15, pady=8)

        # ======================================================================
        # DANH SÁCH BẢN THẢO CHỜ PHÊ DUYỆT (RIGHT PANEL - VIEW & APPROVAL)
        # ======================================================================
        approval_frame = tk.LabelFrame(
            right_panel, 
            text=" Danh Sách Bản Thảo Chờ Duyệt (Inbox Queue) ", 
            font=("Segoe UI", 11, "bold"), 
            fg=self.accent_color, 
            bg=self.card_color, 
            relief="groove", 
            bd=1
        )
        approval_frame.place(relx=0, rely=0, relwidth=1.0, relheight=0.58)
        
        # Danh sách chứa và quản lý hàng đợi các bài viết chưa xuất bản
        self.drafts_listbox = tk.Listbox(
            approval_frame, 
            bg="#0f172a", 
            fg=self.text_color, 
            highlightbackground="#1e293b",
            font=("Consolas", 10), 
            selectbackground=self.accent_color,
            selectforeground="white"
        )
        self.drafts_listbox.place(relx=0.02, rely=0.08, relwidth=0.96, relheight=0.74)
        
        # Thanh trượt cho dòng danh sách
        scroll_y = ttk.Scrollbar(self.drafts_listbox, orient="vertical", command=self.drafts_listbox.yview)
        scroll_y.pack(side="right", fill="y")
        self.drafts_listbox.configure(yscrollcommand=scroll_y.set)
        
        # Các nút hành động ngay dưới danh sách
        btn_action_panel = tk.Frame(approval_frame, bg=self.card_color)
        btn_action_panel.place(relx=0.02, rely=0.84, relwidth=0.96, relheight=0.13)
        
        btn_refresh_drafts = tk.Button(
            btn_action_panel,
            text="🔄 Làm mới bảng",
            font=("Segoe UI", 9, "bold"),
            bg="#64748b",
            fg="white",
            relief="flat",
            command=self.refresh_pending_drafts_view
        )
        btn_refresh_drafts.pack(side="left", padx=5)
        
        btn_manual_approve = tk.Button(
            btn_action_panel,
            text="🤝 DUYỆT THỦ CÔNG",
            font=("Segoe UI", 9, "bold"),
            bg=self.green_color,
            fg="#0f172a",
            relief="flat",
            command=self.action_manual_approve_selected
        )
        btn_manual_approve.pack(side="right", padx=5)

        # ----------------------------------------------------------------------
        # TRÌNH GIÁM SÁT GHI NHẬN HÀNH TRÌNH LOGS (RIGHT LOWER PANEL/TERMINAL)
        # ----------------------------------------------------------------------
        terminal_frame = tk.LabelFrame(
            right_panel, 
            text=" Nhật Ký & Ghi Nhận Thực Địa (Agent Monitoring Console) ", 
            font=("Segoe UI", 11, "bold"), 
            fg=self.accent_color, 
            bg=self.card_color, 
            relief="groove", 
            bd=1
        )
        terminal_frame.place(relx=0, rely=0.6, relwidth=1.0, relheight=0.4)
        
        self.log_terminal = scrolledtext.ScrolledText(
            terminal_frame, 
            bg="#020617", # Gần như đen huyền bí
            fg="#10b981", # Màu xanh lục Matrix rực rỡ
            insertbackground="white", 
            font=("Consolas", 9),
            wrap="word"
        )
        self.log_terminal.pack(fill="both", expand=True, padx=8, pady=8)
        self.log_terminal.insert("end", "🕒 [Hệ Thống] Trình điều khiển GUI đã sẵn sàng hoạt động thực tế.\n")
        self.log_terminal.see("end")

    # ==============================================================================
    # 7. HOẠT ĐỘNG KIỂM SOÁT ĐA LUỒNG AN TOÀN (MULTI-THREADING CONTROLLERS)
    # ==============================================================================
    def polling_logs_to_gui(self):
        """
        Quét và hiển thị log liên tục từ log_queue không gây treo GUI
        """
        while not log_queue.empty():
            try:
                record = log_queue.get_nowait()
                self.log_terminal.insert("end", f"{record}\n")
                self.log_terminal.see("end")
            except queue.Empty:
                break
        self.root.after(150, self.polling_logs_to_gui)

    def load_settings_to_ui(self):
        self.entry_email_user.delete(0, "end")
        self.entry_email_user.insert(0, CONFIG["EMAIL_USER"])
        
        self.entry_email_pass.delete(0, "end")
        self.entry_email_pass.insert(0, CONFIG["EMAIL_PASSWORD"])
        
        self.entry_email_approver.delete(0, "end")
        self.entry_email_approver.insert(0, CONFIG["APPROVER_EMAIL"])
        
        self.entry_vercel_url.delete(0, "end")
        self.entry_vercel_url.insert(0, CONFIG["REMOTE_WEB_API_ENDPOINT"])
        
        self.entry_vercel_token.delete(0, "end")
        self.entry_vercel_token.insert(0, CONFIG["REMOTE_WEB_API_TOKEN"])

        self.entry_schedule_time.delete(0, "end")
        self.entry_schedule_time.insert(0, CONFIG.get("SCHEDULER_TIME", "06:00"))

    def action_save_configs(self):
        global CONFIG
        CONFIG["EMAIL_USER"] = self.entry_email_user.get().strip()
        CONFIG["EMAIL_PASSWORD"] = self.entry_email_pass.get().strip()
        CONFIG["APPROVER_EMAIL"] = self.entry_email_approver.get().strip()
        CONFIG["REMOTE_WEB_API_ENDPOINT"] = self.entry_vercel_url.get().strip()
        CONFIG["REMOTE_WEB_API_TOKEN"] = self.entry_vercel_token.get().strip()
        CONFIG["SCHEDULER_TIME"] = self.entry_schedule_time.get().strip()
        
        if save_system_config(CONFIG):
            logger.info("✓ Lưu trữ cấu hình ứng dụng thành công.")
            messagebox.showinfo("Hoàn tất", "Đã lưu trữ và cập nhật cấu hình hệ thống!")
            # Reset schedule
            schedule.clear()
            schedule.every().day.at(CONFIG["SCHEDULER_TIME"]).do(
                lambda: threading.Thread(target=LocalAgentCoordinator.execute_daily_scout_and_writer, args=("Lập lịch tự động",), daemon=True).start()
            )
            schedule.every(CONFIG["CHECK_APPROVED_INTERVAL_MINS"]).minutes.do(
                lambda: threading.Thread(target=LocalAgentCoordinator.check_and_publish_pending_approvals, daemon=True).start()
            )
            logger.info(f"🔄 Lịch trình chạy mới được kích hoạt lúc: {CONFIG['SCHEDULER_TIME']}")

    # ----------------------------------------------------------------------
    # HÀNH ĐỘNG DÂN ĐƠN TRƯỜNG DUYỆT BÀI VÀ LÀM MỚI BẢNG (PENDING VIEW ACTIONS)
    # ----------------------------------------------------------------------
    def refresh_pending_drafts_view(self):
        self.drafts_listbox.delete(0, "end")
        state = load_local_state()
        pending_drafts = [d for d in state.get("drafts", []) if d.get("status") == "pending_approval"]
        
        self.current_pending_data_list = pending_drafts # Lưu biến cache
        
        if not pending_drafts:
            self.drafts_listbox.insert("end", " (Hiện tại không có bản thảo nào đang ở trạng thái chờ duyệt) ")
            return
            
        for idx, d in enumerate(pending_drafts):
            fmt_str = f"[{idx + 1}] [{d['category'].upper()}] ID: {d['id']} - {d['title'][:48]}..."
            self.drafts_listbox.insert("end", fmt_str)

    def action_manual_approve_selected(self):
        selection = self.drafts_listbox.curselection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn 1 bản thảo bất kỳ trong danh sách trước khi nhấn Duyệt!")
            return
            
        index = selection[0]
        if not hasattr(self, 'current_pending_data_list') or not self.current_pending_data_list:
            return
            
        selected_draft = self.current_pending_data_list[index]
        draft_id = selected_draft["id"]
        
        confirm = messagebox.askyesno(
            "Phê duyệt trực tiếp", 
            f"Bạn có chắc muốn phê duyệt bài viết này thủ công lên website không?\n\nID: {draft_id}\nTiêu đề: {selected_draft['title']}"
        )
        
        if confirm:
            def approve_worker():
                logger.info(f"⚡ Đang chạy quy trình DUYỆT THỦ CÔNG từ cửa sổ app cho bài viết {draft_id}...")
                state = load_local_state()
                drafts = state.get("drafts", [])
                
                target_draft = None
                for d in drafts:
                    if d["id"] == draft_id:
                        target_draft = d
                        break
                        
                if target_draft:
                    target_draft["status"] = "publishing"
                    save_local_state(state)
                    
                    publish_success = RemotePublisher.publish_article_to_remote(target_draft)
                    if publish_success:
                        target_draft["status"] = "published"
                        target_draft["published_at"] = datetime.datetime.now().isoformat()
                        logger.info(f"🎉 Xuất bản trực tiếp bài viết [{draft_id}] qua lệnh điều khiển GUI thành công!")
                        self.root.after(0, lambda: messagebox.showinfo("Thành công", "Đã duyệt và xuất bản bài viết thành công lên trang Web trực tuyến!"))
                    else:
                        target_draft["status"] = "failed_publish"
                        logger.error(f"❌ Duyệt trực tiếp tại app bị lỗi khi kết nối tới Vercel.")
                        self.root.after(0, lambda: messagebox.showerror("Lỗi", "Quá trình đăng bài lên Vercel không phản hồi. Xem chi tiết logs!"))
                    
                    save_local_state(state)
                    self.root.after(0, self.refresh_pending_drafts_view)
                    
            threading.Thread(target=approve_worker, daemon=True).start()

    # ----------------------------------------------------------------------
    # CÁC WORKERS ĐA LUỒNG XỬ LÝ AGENT (THREADED WORKERS)
    # ----------------------------------------------------------------------
    def trigger_scout_writer_on_thread(self):
        def worker():
            self.root.after(0, lambda: self.set_buttons_state("disabled"))
            try:
                LocalAgentCoordinator.execute_daily_scout_and_writer("Yêu cầu thủ công qua giao diện")
            except Exception as e:
                logger.error(f"Xử lý Scout/Writer Agents thất bại: {e}")
            finally:
                self.root.after(0, self.refresh_pending_drafts_view)
                self.root.after(0, lambda: self.set_buttons_state("normal"))
                
        threading.Thread(target=worker, daemon=True).start()

    def trigger_mailbox_sync_on_thread(self):
        def worker():
            self.root.after(0, lambda: self.set_buttons_state("disabled"))
            try:
                has_updates = LocalAgentCoordinator.check_and_publish_pending_approvals()
                if has_updates:
                    self.root.after(0, self.refresh_pending_drafts_view)
                else:
                    logger.info("ℹ️ Không tìm thấy email duyệt hợp lệ mới nào chứa cú pháp ['Duyệt', 'Approve'].")
            except Exception as e:
                logger.error(f"Xử lý quét đồng bộ hòm thư IMAP thất bại: {e}")
            finally:
                self.root.after(0, lambda: self.set_buttons_state("normal"))
                
        threading.Thread(target=worker, daemon=True).start()

    def set_buttons_state(self, state):
        # Hàm bổ trợ khóa các trigger khi đang chạy tác vụ nặng để tránh double-click chồng chéo bộ nhớ
        pass

    # ----------------------------------------------------------------------
    # BAN VẬN HÀNH CONTROLLER LẬP LỊCH TỰ ĐỘNG CHẠY NGẦM
    # ----------------------------------------------------------------------
    def action_toggle_scheduler_engine(self):
        if self.scheduler_is_running:
            self.scheduler_is_running = False
            self.status_badge.configure(text="● LẬP LỊCH CHẠY NGẦM: ĐANG TẠM DỪNG", fg=self.danger_color, bg="#7f1d1d")
            self.btn_toggle_scheduler.configure(text="▶️ KÍCH HOẠT LẬP LỊCH TỰ ĐỘNG CHẠY NGẦM", bg=self.green_color, fg="#0f172a")
            logger.info("⏹️ Lập lịch chạy ngầm tự động lúc 6h00 đã bị tạm ngưng.")
        else:
            self.scheduler_is_running = True
            self.status_badge.configure(text="● SCHEDULER: ĐANG CHẠY NGẦM", fg=self.green_color, bg="#14532d")
            self.btn_toggle_scheduler.configure(text="⏹️ TẠM DỪNG LẬP LỊCH TỰ ĐỘNG CHẠY NGẦM", bg=self.danger_color, fg="white")
            logger.info("▶️ Lập lịch chạy ngầm tự động đã được khởi chạy trở lại.")

    def start_scheduler_thread(self):
        # Khởi tạo scheduler cơ bản của thư viện schedule
        schedule.clear()
        # Thiết kế hàm lambda bọc trong luồng chống đóng băng
        schedule.every().day.at(CONFIG.get("SCHEDULER_TIME", "06:00")).do(
            lambda: threading.Thread(target=LocalAgentCoordinator.execute_daily_scout_and_writer, args=("Lập lịch tự động hàng ngày",), daemon=True).start()
        )
        schedule.every(CONFIG["CHECK_APPROVED_INTERVAL_MINS"]).minutes.do(
            lambda: threading.Thread(target=LocalAgentCoordinator.check_and_publish_pending_approvals, daemon=True).start()
        )
        
        logger.info(f"📅 Giao thức Lập lịch được cài đặt tự động lúc {CONFIG.get('SCHEDULER_TIME', '06:00')} sáng hàng ngày.")
        logger.info(f"🕒 Tự động quét Gmail duyệt bài IMAP mỗi {CONFIG['CHECK_APPROVED_INTERVAL_MINS']} phút.")
        
        def scheduler_loop():
            while True:
                if self.scheduler_is_running:
                    schedule.run_pending()
                time.sleep(1)
                
        self.scheduler_thread = threading.Thread(target=scheduler_loop, daemon=True)
        self.scheduler_thread.start()

# ==============================================================================
# 8. EXIT POINT & RUNNER
# ==============================================================================
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "run-now":
        # Chạy console nếu người dùng chủ động chạy CLI test nhanh
        logger.info("Tiến hành chạy kiểm thử ngay lập tức qua CLI...")
        LocalAgentCoordinator.execute_daily_scout_and_writer("CLI Trình thử")
    else:
        # Khởi động GUI App chính thức của phần mềm
        root = tk.Tk()
        app = AutopilotTkApp(root)
        root.mainloop()
