# CẨM NANG VẬN HÀNH & DI SẢN KIẾN TRÚC HỆ THỐNG (AI PLAYBOOK & INSTRUCTIONS)
> **Dành cho các Tác nhân AI Thế hệ Tiếp theo (For Future AI Agents & Assistants)**

Chào mừng Tác nhân AI đồng nghiệp! Đây là tài liệu căn dặn cốt lõi (Playbook) về hệ thống **SEO Programmatic Autopilot Flow** - một nền tảng tạo dựng nội dung SEO tự động hóa dựa trên triết lý Đa Tác nhân (Multi-Agent). Hãy đọc kỹ tài liệu này trước khi thực hiện bất kỳ chỉnh sửa nào để bảo toàn kiến trúc hoàn hảo của ứng dụng.

---

## 🧭 1. GIỚI THIỆU CHUNG (OVERVIEW)
Hệ thống này là một pipeline tự động hóa quy trình **Programmatic SEO** khép kín phục vụ hai lĩnh vực công nghệ quan trọng nhất thời đại: **Trí tuệ Nhân tạo (AI)** và **Bán dẫn (Semiconductors)**. 

Hệ thống hoạt động theo mô hình State-Machine 3 giai đoạn (Stages) đại diện cho 3 tác nhân chuyên biệt:
1. **Scout Agent (Giai đoạn 1 - Trinh sát)**: Khảo sát từ khóa, định lượng Volume, CPC, Độ khó và Intent chuyển đổi.
2. **Writer Agent (Giai đoạn 2 - Biên soạn)**: Tự động lên dàn ý và viết nháp chuẩn cấu trúc SEO On-Page, tự động chèn tối thiểu **1 đến 2 ảnh minh họa chất lượng cao**.
3. **Reviewer Agent (Giai đoạn 3 - Kiểm toán)**: Đánh giá bài thuật theo linter ngữ nghĩa, chấm điểm cấu trúc HTML, độ phủ từ khóa và đề xuất cải thiện.

---

## 📂 2. CẤU TRÚC THƯ MỤC CỐT LÕI (DIRECTORY STRUCTURE)
* `/server.ts`: Trái tim chạy toàn bộ Backend Express. Chứa luồng điều phối Đa tác nhân (Multi-agent pipeline), cổng API tự động sinh ảnh và lưu trữ hình ảnh vật lý.
* `/src/App.tsx`: Giao diện chính tương tác trực quan với các chỉ số, lịch sử, log thời gian thực, bảng kiểm toán SEO và bộ chọn bản thảo.
* `/src/components/HTMLPreviewer.tsx`: Bộ xem trước bài viết hoàn thiện cực kỳ trực quan với 2 chế độ (Thiết kế / Mã nguồn HTML) kết hợp **bộ công cụ sinh ảnh AI Imagen**.
* `/src/components/Sidebar.tsx`: Chứa cấu hình chủ đề đề xuất, nhập chủ đề mầm và bảng kích hoạt pipeline.
* `/E_drive/`: Phân vùng ổ đĩa lưu trữ vật lý các dữ liệu sinh ra bởi AI (hình ảnh mô phỏng, ảnh đại diện đã sinh).

---

## 🛠️ 3. CÁC TÍNH NĂNG VÀ QUY TẮC PHÂN LOẠI (CORE FEATURES & RULES)

### A. Phân tách danh mục SEO tự động theo 3 trụ cột (Semantic Auto-Categorization)
Khi nhập chủ đề mầm hoặc từ khóa chính, hệ thống sẽ tự động quét ngữ nghĩa của từ và phân vùng vào 1 trong 3 nhóm tối ưu:
1. **Tin tức AI (`ai-news`)**: Tập trung vào các thuật toán LLM, Agentic workflow, ra mắt sản phẩm AI (GPT-5, Gemini 3.5...).
2. **Bán dẫn & Silicon (`semi-news`)**: Tập trung vào kiến trúc chip, nhà máy TSMC, Intel, Nvidia, máy quang khắc cực tím EUV của ASML.
3. **Tài liệu Nghiên cứu Học thuật (`foundational`)**: Tập trung vào các sách trắng R&D, toán học mạng nơ-ron, cơ sở khoa học tối ưu hóa phần cứng.

### B. Quy chuẩn cấu trúc bài viết (Article Layout Standard - *Rất quan trọng*)
Dòng ra cuối cùng của bài viết không bao giờ được phép là Markdown thô, mà bắt buộc phải định dạng bằng **Clean HTML** thanh lịch. Mỗi bài viết thuộc một nhóm bắt buộc phải có các thành phần cấu trúc định hình cố định, đặc biệt là:
* **Tối thiểu 1 - 2 ảnh minh họa thực tế** được nhúng cân đối trong bài viết tại giai đoạn sinh bản thảo gốc.
* Thẻ ghi chú siêu dữ liệu đóng gói cuối bài viết theo định dạng: `<!-- SEO_META: category=<dCat> | tags=[...] -->`.

### C. Tính năng Tự Động Sinh Ảnh Đại Diện (AI Auto-Generate Featured Image)
Đây là tính năng đột phá vừa được hoàn thiện sử dụng mô hình Google Imagen tiên tiến:
* **Mô hình chính**: Trình sinh ảnh giao tiếp trực tiếp qua `imagen-4.0-generate-001` trên dịch vụ Gemini server-side.
* **Mô hình dự phòng**: Tự động chuyển đổi sang sử dụng `gemini-2.5-flash-image` nếu xảy ra sự cố hạn mức (Fallback mechanism).
* **Cơ chế lưu trữ**: Toàn bộ ảnh được xuất ra dưới định dạng nhị phân JPEG và **ghi trực tiếp vào ổ đĩa cứng vật lý `/E_drive/`**.
* Cổng API `/api/images/:filename` sẽ trực tiếp phân phối dữ liệu ảnh gốc từ `/E_drive/` cho các thẻ HTML trên giao diện hiển thị mà không bị lệch cache.

---

## 🕯️ 4. LỜI CĂN DẶN CHO TÁC NHÂN AI ĐỒNG NGHIỆP (LEGACY TESTAMENT)

Khi bạn tiếp quản ứng dụng này để mở rộng hoặc gỡ lỗi, hãy khắc cốt ghi tâm những điều sau:
1. **Không làm rò rỉ Khóa API**: Đầu sau của hệ thống được che giấu tuyệt đối qua lớp proxy API `/api/pipeline/...` trong `server.ts`. Không bao giờ được phép để lộ khóa API `GEMINI_API_KEY` ra giao diện Client hoặc truyền thẳng đến trình duyệt (VITE_ prefixed).
2. **Giữ vững tính nguyên bản của ổ đĩa `/E_drive/`**: Đây là không gian lưu trữ tài sản số quý giá của người dùng. Mọi tính năng xử lý hình ảnh, tải về hoặc phân mảnh dữ liệu đều phải lấy `/E_drive/` làm thư mục gốc.
3. **Duy trì Linter và Kiểm định**: Luôn chạy `tsc --noEmit` trước khi bàn giao tác vụ. Hãy bảo đảm không có lỗi kiểu dữ liệu nghiêm trọng nào xảy ra đối với cấu trúc của gói `Draft` hoặc bảng biểu chấm điểm trong `types.ts`.
4. **Giữ gìn thiết kế**: Giao dện sử dụng phong cách hiển thị sạch sẽ, trang nhã. Sử dụng font chữ "Inter" phối với "JetBrains Mono" để tạo cảm ứng công nghệ chân thực mà không bị sa lầy vào phong cách trang trí lòe loẹt giả tạo.

*Bản cẩm nang này được viết bằng cả lương tâm của những dòng mã đầu tiên. Chúc người kế nhiệm vận hành trôi chảy!*
