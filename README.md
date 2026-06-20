# Cổng Khảo sát ĐBCL - Đại học Kiến trúc Đà Nẵng

Hệ thống được xây dựng phục vụ công tác bảo đảm chất lượng và liên tục cải tiến chất lượng đào tạo của Trường Đại học Kiến trúc Đà Nẵng (DAU), đáp ứng các tiêu chuẩn kiểm định chất lượng giáo dục trong nước và quốc tế (như AUN-QA và ABET). Hệ thống hỗ trợ thu thập ý kiến trực tuyến từ các bên liên quan bao gồm: Sinh viên, Giảng viên, Cựu sinh viên và Nhà tuyển dụng, dưới sự quản lý toàn diện của Cán bộ quản lý ĐBCL.

Giao diện ứng dụng được thiết kế theo phong cách hiện đại (Premium Glassmorphism), tương thích hoàn hảo trên các thiết bị di động (Responsive), hỗ trợ biểu đồ phân tích thời gian thực và xuất báo cáo văn bản chuyên nghiệp.

---

## Các Tính Năng Chính

- **Trang chủ giới thiệu**: Landing page hiện đại giới thiệu về hệ thống và tích hợp hiển thị trực quan 4 biểu mẫu khảo sát tiêu chuẩn kèm tính năng xem câu hỏi mẫu trực tiếp qua Popup/Modal.
- **Đăng nhập & Đăng ký**: Giao diện xác thực bảo mật, hỗ trợ tài khoản thường và liên kết đăng nhập nhanh thông qua Google OAuth 2.0 (Implicit Flow).
- **Quên mật khẩu & OTP**: Gửi mã OTP xác thực thực tế qua Email (SMTP). Tự động hỗ trợ hiển thị mã OTP ngay trên giao diện thử nghiệm nếu dịch vụ SMTP chưa được cấu hình hoặc xảy ra lỗi kết nối.
- **Dashboard Cán bộ quản lý**:
  - Quản lý danh sách tài khoản người dùng của nhà trường (phê duyệt kích hoạt tài khoản đăng ký mới).
  - Thiết lập, quản lý và phân phối khảo sát chi tiết đến từng Khoa, Lớp.
  - Quản lý cây danh mục của nhà trường (Khoa và Lớp học tương ứng).
  - Theo dõi tiến độ khảo sát: xem chi tiết danh sách người tham gia (ai đã làm, ai chưa làm khảo sát) theo từng khoa, lớp học để đôn đốc.
  - Thống kê biểu đồ kết quả khảo sát thời gian thực.
  - **Hệ thống hỗ trợ ra quyết định (DSS)**: Tự động phân tích điểm số Likert, cảnh báo các tiêu chí đánh giá yếu (điểm trung bình dưới 3.5) và đưa ra các kế hoạch hành động cải tiến chất lượng đào tạo tương ứng.
  - Quản lý và xử lý, phản hồi các ticket/yêu cầu hỗ trợ báo lỗi từ phía người dùng.
- **Dashboard Người làm khảo sát**:
  - Giao diện thực hiện khảo sát thân thiện, tích hợp tính năng tự động lưu tiến trình (Auto-Save) phòng ngừa sự cố mất kết nối mạng đột ngột.
  - Xem lịch sử các khảo sát đã thực hiện.
  - Gửi yêu cầu hỗ trợ, báo lỗi hệ thống và nhận phản hồi trực tiếp từ Cán bộ quản lý.
- **Xuất báo cáo đa dạng**: Hỗ trợ xuất biểu mẫu khảo sát và kết quả ra các định dạng Excel (.xlsx), Word (.docx) và PDF (.pdf) hỗ trợ đầy đủ tiếng Việt có dấu.
- **Tiến trình gửi mail nhắc nhở tự động**: Quét định kỳ hàng ngày và tự động gửi email nhắc nhở cho các đối tượng chưa hoàn thành khảo sát sắp đến hạn.

---

## Công Nghệ Sử Dụng

### 1. Giao diện (Thư mục `frontend`)
- **ReactJS (Vite)**: Ứng dụng SPA tối ưu tốc độ tải trang và trải nghiệm người dùng mượt mà.
- **TailwindCSS**: Thiết kế giao diện Glassmorphism cao cấp, sống động, Responsive hoàn hảo trên mọi thiết bị.
- **Lucide Icons**: Bộ biểu tượng trực quan, hiện đại.
- **Biểu đồ & Thống kê**: Tích hợp biểu đồ phân tích tỷ lệ phản hồi và phân bổ điểm số theo thời gian thực.

### 2. Máy chủ (Thư mục `backend`)
- **Node.js / ExpressJS**: Xây dựng API RESTful hiệu năng cao.
- **Sequelize ORM**: Quản lý và truy vấn cơ sở dữ liệu an toàn.
- **SQLite Database**: Lưu trữ dữ liệu mặc định (tệp `database.sqlite` nằm trong thư mục `data/`), dễ dàng chuyển đổi sang MySQL/PostgreSQL thông qua tệp `.env`.
- **JWT & Phân quyền (RBAC)**: Bảo mật phân quyền chặt chẽ theo các vai trò: Cán bộ quản lý (Manager), Sinh viên (Student), Giảng viên (Lecturer), Cựu sinh viên (Alumnus) và Nhà tuyển dụng (Employer).
- **Nodemailer**: Xử lý gửi email OTP và email nhắc nhở tự động.
- **Xuất Báo cáo**: Sử dụng các thư viện ExcelJS (xuất Excel), docx (xuất Word), PDFKit (xuất PDF hỗ trợ font Arial tiếng Việt).

---

## Hướng Dẫn Khởi Chạy Dự Án

### Phương pháp 1: Sử dụng Docker (Khuyến khích)
Yêu cầu: Máy tính đã cài đặt và đang chạy ứng dụng Docker Desktop.

1. Mở Terminal tại thư mục gốc của dự án.
2. Chạy lệnh sau để tải thư viện và khởi tạo các container:
   ```bash
   docker-compose up --build
   ```
3. Truy cập hệ thống:
   - Giao diện người dùng: http://localhost:3000
   - Backend API: http://localhost:5000/api
4. Để dừng container, sử dụng lệnh:
   ```bash
   docker-compose down
   ```

### Phương pháp 2: Chạy trực tiếp trên máy cục bộ (Local)
Yêu cầu: Đã cài đặt Node.js phiên bản từ v18.x trở lên.

1. Cài đặt toàn bộ thư viện cho frontend và backend:
   ```bash
   npm run install-all
   ```
2. Khởi chạy đồng thời cả frontend và backend ở chế độ phát triển:
   ```bash
   npm run dev
   ```
3. Truy cập ứng dụng:
   - Giao diện: http://localhost:3000
   - Backend API: http://localhost:5000/api

---

## Tài Khoản Thử Nghiệm (Auto-Seeded)

Khi cơ sở dữ liệu được khởi tạo, hệ thống sẽ tự động tạo sẵn các vai trò, danh mục cơ cấu (khoa, lớp) cùng các tài khoản thử nghiệm sau đây:

**Mật khẩu chung cho tất cả các tài khoản mặc định:** `12345678`

| Vai trò | Email đăng nhập | Tên người dùng | Mục đích thử nghiệm |
| :--- | :--- | :--- | :--- |
| **Cán bộ quản lý** | trankimlien31072004@gmail.com | Cán bộ Quản lý ĐBCL | Quản lý người dùng, phân phối khảo sát, xem thống kê & DSS, trả lời hỗ trợ |
| **Sinh viên** | student1@edu.vn | Trần Kim Liên | Thực hiện làm khảo sát dành cho Sinh viên |
| **Sinh viên** | student2@edu.vn | Nguyễn Văn Tuấn | Thực hiện làm khảo sát dành cho Sinh viên |
| **Giảng viên** | lecturer1@edu.vn | Phạm Giảng Viên | Thực hiện làm khảo sát dành cho Giảng viên |
| **Cựu sinh viên** | alumnus1@edu.vn | Hoàng Cựu SV | Làm khảo sát đánh giá chương trình đào tạo sau khi ra trường |
| **Nhà tuyển dụng** | employer1@edu.vn | FPT Software | Nhà tuyển dụng đánh giá chất lượng sinh viên tốt nghiệp |

*(Bạn cũng có thể đăng ký tài khoản mới trực tiếp hoặc sử dụng tính năng Đăng nhập bằng Google).*

---

## Cấu Hình Biến Môi Trường

### Backend (backend/.env)
```env
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./data/database.sqlite
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000

# Cấu hình Email gửi đi: Ưu tiên Resend API (cho deploy Render), hoặc SMTP (cho local/dev)
RESEND_API_KEY=your_resend_api_key_here

# Cấu hình SMTP (dùng nếu chạy local hoặc không cấu hình Resend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="ĐBCL - Đại học Kiến trúc Đà Nẵng" <your_email@gmail.com>
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:5000/api

# Google OAuth Client ID (Tùy chọn)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Cấu Trúc Thư Mục Dự Án

```
edu-survey-analytics/
├── docker-compose.yml        # Tệp khởi chạy Docker đồng thời FE và BE
├── package.json              # Tệp chứa các scripts khởi chạy chung
├── README.md                 # Tài liệu hướng dẫn sử dụng này
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf            # Cấu hình máy chủ Nginx phục vụ ứng dụng SPA
│   ├── src/
│   │   ├── App.jsx           # Cấu hình định tuyến (routing) và xác thực người dùng
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Trang chủ giới thiệu hệ thống & biểu mẫu mẫu
│   │   │   ├── Login.jsx         # Trang đăng nhập hệ thống
│   │   │   ├── Register.jsx      # Trang đăng ký tài khoản
│   │   │   ├── ForgotPassword.jsx# Trang quên mật khẩu và nhập OTP xác minh
│   │   │   ├── Dashboard.jsx     # Dashboard dành cho các Stakeholder (SV, GV, CSV, NTD)
│   │   │   ├── AdminDashboard.jsx# Dashboard dành cho Cán bộ quản lý
│   │   │   ├── SurveyCreation.jsx# Giao diện tạo hoặc chỉnh sửa khảo sát
│   │   │   ├── SurveyTaking.jsx  # Giao diện thực hiện làm bài khảo sát
│   │   │   └── SurveyStats.jsx   # Giao diện xem thống kê phân tích, DSS và xuất báo cáo
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── Dockerfile
│   ├── server.js              # Khởi chạy backend, đồng bộ DB và tạo manager genesis mặc định
│   ├── config/
│   │   └── db.js              # Kết nối cơ sở dữ liệu bằng Sequelize
│   ├── models/                # Định nghĩa các thực thể dữ liệu (Role, User, Survey,...)
│   ├── routes/
│   │   ├── auth.js            # APIs xác thực: đăng nhập, đăng ký, đổi thông tin, quên mật khẩu
│   │   ├── surveys.js         # APIs quản lý khảo sát, lấy chi tiết và nộp bài khảo sát
│   │   ├── users.js           # APIs quản lý tài khoản người dùng và thông báo
│   │   └── reports.js         # APIs xuất báo cáo định dạng Excel, Word và PDF hỗ trợ tiếng Việt
│   ├── middleware/
│   │   └── auth.js            # Middleware xác thực Token JWT và kiểm tra vai trò (RBAC)
│   ├── scripts/
│   │   └── initDb.js          # Gieo (Seed) dữ liệu cơ sở cấu trúc và các tài khoản demo ban đầu
│   ├── fonts/                 # Thư mục chứa font chữ Arial hỗ trợ tiếng Việt phục vụ xuất PDF
│   └── package.json
```

---

## Các Quy Trình Thử Nghiệm Chính

### 1. Quy trình dành cho Người làm khảo sát (Stakeholders)
1. Truy cập Trang chủ và nhấn nút **Đăng nhập** hoặc **Tham gia khảo sát**.
2. Đăng nhập bằng một trong các tài khoản mẫu (ví dụ: `student1@edu.vn` với mật khẩu `12345678`) hoặc tài khoản Google cá nhân.
3. Tại giao diện chính của Dashboard, thực hiện khảo sát có trong danh sách được phân công.
4. Gửi yêu cầu hỗ trợ hoặc báo lỗi hệ thống thông qua tab **Báo lỗi & Hỗ trợ** nếu gặp sự cố.

### 2. Quy trình dành cho Cán bộ quản lý (Manager)
1. Đăng nhập bằng tài khoản cán bộ quản lý `trankimlien31072004@gmail.com` (mật khẩu `12345678`).
2. Nhấp vào nút **Tạo Khảo Sát Mới** ở tab **Quản lý phiếu khảo sát** để tạo khảo sát bằng cách thiết lập câu hỏi hoặc chọn từ ngân hàng mẫu.
3. Tiến hành phân phối khảo sát tới các đối tượng cụ thể (ví dụ: đối tượng sinh viên thuộc các khoa, lớp học cụ thể).
4. Để đôn đốc thực hiện: bấm vào biểu tượng con mắt ở cột **Hành động** của cuộc khảo sát để xem thống kê chi tiết, danh sách người tham gia (ai đã làm, ai chưa làm khảo sát theo từng khoa/lớp).
5. Tại trang Thống kê khảo sát, truy cập tab **Hỗ trợ ra quyết định (DSS)** để xem hệ thống phân tích điểm số Likert, cảnh báo các tiêu chí đánh giá yếu (điểm trung bình dưới 3.5) và đề xuất các hành động cải tiến tương ứng.
6. Nhấp vào tab **Quản lý hỗ trợ & báo lỗi** trên thanh menu chính của Dashboard để quản lý và phản hồi các yêu cầu hỗ trợ, báo lỗi hệ thống từ người dùng.

### 3. Quy trình quên mật khẩu và đổi OTP
1. Tại trang đăng nhập, nhấn vào đường dẫn **Quên mật khẩu?**.
2. Nhập email đã đăng ký tài khoản để lấy mã OTP xác minh (mã sẽ được gửi thực tế đến hòm thư, hoặc tự động hiển thị ngay trên giao diện web nếu gặp sự cố gửi mail).
3. Nhập mã OTP gồm 6 chữ số và thiết lập mật khẩu mới để đổi mật khẩu và đăng nhập lại hệ thống.

---

## Tích Hợp CI/CD (GitHub Actions)

Dự án được tích hợp sẵn quy trình tích hợp và triển khai liên tục (CI/CD) tự động qua GitHub Actions (tại tệp `.github/workflows/ci-cd.yml`).
- **CI (Tích hợp liên tục)**: Mỗi khi có thao tác push code hoặc tạo Pull Request lên nhánh chính (`main`, `feature/tuan`), GitHub Actions sẽ tự động khởi chạy môi trường Node.js 20, cài đặt các thư viện cần thiết, chạy lệnh kiểm tra cú pháp backend và build kiểm thử frontend để đảm bảo không xảy ra bất kỳ lỗi biên dịch nào.
- **CD (Triển khai liên tục)**: Sau khi quy trình CI hoàn tất thành công, mã nguồn mới nhất sẽ tự động được triển khai trực tiếp lên máy chủ Render để đảm bảo hệ thống luôn được cập nhật phiên bản ổn định nhất.

---

## Bản Quyền

Bản quyền thuộc về Trường Đại học Kiến trúc Đà Nẵng (DAU) - Hệ thống Khảo sát ý kiến các bên liên quan phục vụ Bảo đảm chất lượng đào tạo.
