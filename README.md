# 🎓 Phần Mềm Khảo Sát Lấy Ý Kiến Các Bên Liên Quan Trong Giáo Dục (Topic 2)

Dự án được xây dựng dựa trên tài liệu mô tả chức năng của SDC, phục vụ kiểm định chất lượng giáo dục theo chuẩn AUN-QA và ABET. Hệ thống hỗ trợ đa đối tượng sử dụng (Sinh viên, Giảng viên, Cựu sinh viên, Nhà tuyển dụng, Cán bộ quản lý và Admin).

Hệ thống được thiết kế theo phong cách **Premium Glassmorphism** hiện đại, responsive hoàn hảo và hỗ trợ trực quan hóa dữ liệu qua biểu đồ cùng tính năng xuất báo cáo chuyên nghiệp.

---

## ✨ Tính Năng Chính

| Tính năng | Mô tả |
| :--- | :--- |
| 🏠 **Trang giới thiệu** | Trang Landing đa section (Hero, Giới thiệu, Đối tượng, Liên hệ, Footer) với video background sắc nét |
| 🔐 **Đăng nhập / Đăng ký** | Form xác thực truyền thống (email + mật khẩu) với video background |
| 🔑 **Đăng nhập Google OAuth 2.0** | Tích hợp Google Implicit Flow hoặc nhập email Google thủ công (fallback) |
| 🔓 **Quên mật khẩu** | Gửi mã OTP thực qua email (SMTP) để đặt lại mật khẩu |
| 👤 **Sửa thông tin cá nhân** | Chỉnh sửa họ tên, mã nhận diện, đổi mật khẩu (ngoại trừ tài khoản demo) |
| 📊 **Dashboard Admin/Manager** | Quản lý khảo sát, xem thống kê biểu đồ thời gian thực, quản lý người dùng |
| 📝 **Dashboard Stakeholder** | Danh sách khảo sát được phân công, thực hiện khảo sát, xem thông báo |
| 📄 **Xuất báo cáo đa dạng** | 3 định dạng: **Excel (.xlsx)**, **Word (.docx)**, **PDF (.pdf)** — hỗ trợ phông chữ tiếng Việt |
| 🛎️ **Hệ thống thông báo** | Nhận lời mời tham gia khảo sát, nhắc nhở deadline |
| 💾 **Auto-Save** | Tự động lưu tiến trình làm khảo sát vào `localStorage` phòng trường hợp mất mạng |
| 🏠 **Điều hướng thông minh** | Nút quay về Trang chủ trên mọi trang; Navbar hiển thị trạng thái đăng nhập |

---

## 🛠️ Công Nghệ Sử Dụng

### 1. Frontend (`/frontend`)
- **ReactJS (Vite)**: SPA mượt mà, tối ưu hiệu năng tải trang.
- **TailwindCSS**: CSS Utility-first cùng biến màu tùy chỉnh cho hiệu ứng chuyển màu cao cấp.
- **Lucide Icons**: Bộ icon hiện đại, sắc nét.
- **Chart & Analytics**: Biểu đồ hiển thị kết quả phân bố câu trả lời trực quan theo thời gian thực.
- **Google OAuth 2.0**: Đăng nhập bằng tài khoản Google thực (Implicit Flow) hoặc fallback nhập email thủ công.

### 2. Backend (`/backend`)
- **ExpressJS**: Lập trình API RESTful tinh gọn.
- **Sequelize ORM**: Quản lý cơ sở dữ liệu đồng bộ.
- **SQLite Database**: Mặc định cho môi trường phát triển giúp **chạy ngay lập tức** mà không cần cấu hình MySQL phức tạp (Mã nguồn ORM dễ dàng cấu hình chuyển đổi sang MySQL/PostgreSql chỉ trong 3 dòng tại file `.env`).
- **JWT Authentication & RBAC**: Xác thực qua token lưu ở Client và phân quyền vai trò người dùng (Admin / Manager / Student / Lecturer / Alumnus / Employer).
- **Nodemailer**: Gửi email OTP thực cho tính năng Quên mật khẩu.
- **ExcelJS**: Xuất file Excel chuyên nghiệp.
- **docx**: Xuất file Word với table định dạng đẹp.
- **PDFKit**: Xuất file PDF có nhúng phông chữ `arial.ttf` / `arialbd.ttf` hỗ trợ tiếng Việt đầy đủ.

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án

### Cách 1: Chạy bằng Docker (Khuyên dùng)
Yêu cầu: Máy tính của bạn đã cài sẵn và đang chạy **Docker Desktop**.

1. Mở Terminal/PowerShell tại thư mục dự án `edu-survey-analytics`.
2. Khởi chạy Docker Compose để tự động tải thư viện, dựng container và kết nối:
   ```bash
   docker-compose up --build
   ```
3. Truy cập hệ thống:
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
4. Dừng container:
   ```bash
   docker-compose down
   ```

### Cách 2: Chạy trực tiếp trên máy cục bộ (Local)
Yêu cầu: Máy đã cài **Node.js (v18.x trở lên)**.

1. Tại thư mục gốc `edu-survey-analytics`, cài đặt toàn bộ thư viện cho cả FE và BE:
   ```bash
   npm run install-all
   ```
2. Chạy đồng thời cả Frontend và Backend bằng 1 câu lệnh duy nhất:
   ```bash
   npm run dev
   ```
3. Truy cập ứng dụng:
   - Frontend: [http://localhost:3000](http://localhost:3000) (hoặc port hiển thị trên terminal)
   - Backend: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Tài Khoản Thử Nghiệm Hệ Thống (Auto-Seeded)

Cơ sở dữ liệu đã tự động seed đầy đủ các vai trò, người dùng mẫu cùng các biểu mẫu khảo sát thực tế và dữ liệu phản hồi mẫu để vẽ biểu đồ Dashboard trực quan.

**Mật khẩu chung cho tất cả các tài khoản là:** `12345678`

| Vai trò | Email đăng nhập | Tên người dùng | Mục đích thử nghiệm |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@edu.vn` | Nguyễn Quản Trị | Tạo & Quản lý khảo sát, cấu hình câu hỏi, phân quyền |
| **Cán bộ quản lý** | `manager@edu.vn` | Trần Cán Bộ | Xem Dashboard thống kê biểu đồ, xuất file báo cáo Excel/Word/PDF |
| **Sinh viên** | `student1@edu.vn` | Trần Kim Liên | Làm khảo sát dành cho Sinh viên |
| **Sinh viên** | `student2@edu.vn` | Nguyễn Văn Tuấn | Làm khảo sát dành cho Sinh viên |
| **Giảng viên** | `lecturer1@edu.vn` | Phạm Giảng Viên | Làm khảo sát dành cho Giảng viên |
| **Cựu sinh viên** | `alumnus1@edu.vn` | Hoàng Cựu SV | Làm khảo sát đánh giá CTĐT sau ra trường |
| **Nhà tuyển dụng** | `employer1@edu.vn` | FPT Software | Đánh giá chất lượng sinh viên tốt nghiệp |

> 💡 Ngoài ra, bạn có thể **Đăng ký** tài khoản mới hoặc **Đăng nhập bằng Google** thực để tạo tài khoản và trải nghiệm hệ thống.

---

## ⚙️ Cấu Hình Biến Môi Trường

### Backend (`/backend/.env`)
```env
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./data/database.sqlite
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000

# SMTP cho tính năng Quên mật khẩu (gửi OTP thực)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api

# Google OAuth 2.0 (tùy chọn)
# Tạo Client ID tại: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

> ⚠️ Nếu `VITE_GOOGLE_CLIENT_ID` chưa được cấu hình, nút "Đăng nhập bằng Google" sẽ chuyển sang chế độ fallback (nhập email/tên thủ công).

---

## 📁 Cấu Trúc Dự Án

```
edu-survey-analytics/
├── docker-compose.yml        # Khởi tạo đồng thời FE + BE container
├── package.json              # Root scripts (install-all, dev)
├── README.md
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf            # Config phục vụ SPA qua Nginx
│   ├── src/
│   │   ├── App.jsx           # Root component, routing, auth state
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Trang giới thiệu (Hero + About + Stakeholders + Contact)
│   │   │   ├── Login.jsx         # Đăng nhập (email/password + Google OAuth)
│   │   │   ├── Register.jsx      # Đăng ký tài khoản mới
│   │   │   ├── ForgotPassword.jsx# Quên mật khẩu (OTP qua email)
│   │   │   ├── Dashboard.jsx     # Dashboard cho Stakeholder (Sinh viên/GV/CSV/NTD)
│   │   │   ├── AdminDashboard.jsx# Dashboard cho Admin/Manager
│   │   │   ├── SurveyCreation.jsx# Tạo/Chỉnh sửa khảo sát (Admin)
│   │   │   ├── SurveyTaking.jsx  # Thực hiện khảo sát
│   │   │   └── SurveyStats.jsx   # Xem thống kê biểu đồ
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── Dockerfile
│   ├── server.js              # Entry point, khởi tạo Express + auto-seed DB
│   ├── config/
│   │   └── db.js              # Sequelize config (SQLite/MySQL/PostgreSQL)
│   ├── models/                # Sequelize models (Role, User, Survey, Question, ...)
│   ├── routes/
│   │   ├── auth.js            # Login, Register, Google Login, Forgot Password, Profile
│   │   ├── surveys.js         # CRUD khảo sát, submit phản hồi
│   │   ├── users.js           # Quản lý người dùng, thông báo
│   │   └── reports.js         # Xuất báo cáo Excel / Word / PDF
│   ├── middleware/
│   │   └── auth.js            # JWT verify + Role authorization
│   ├── scripts/
│   │   └── initDb.js          # Auto-seed: roles, users, surveys, mock responses
│   ├── fonts/                 # arial.ttf + arialbd.ttf (cho PDF tiếng Việt)
│   └── package.json
```

---

## 📋 Các Quy Trình Thử Nghiệm Điển Hình (Luồng E2E)

### 1. Luồng Sinh viên
1. Truy cập `http://localhost:3000` → Trang Landing giới thiệu hệ thống
2. Click **"Tham gia khảo sát"** → Chuyển đến trang Đăng nhập
3. Đăng nhập với `student1@edu.vn` / `12345678` (hoặc dùng nút **Chọn tài khoản Demo**)
4. Vào Dashboard → Xem danh sách khảo sát được phân công
5. Click **"Tham gia khảo sát"** → Điền thang điểm Likert và ý kiến → Gửi
6. Vào tab **"Thông tin cá nhân"** → Sửa họ tên, mã nhận diện

### 2. Luồng Admin
1. Đăng nhập với `admin@edu.vn` / `12345678`
2. Dashboard hiển thị tất cả khảo sát + thống kê tổng quan
3. Click **"Tạo Khảo Sát Mới"** → Nhập tiêu đề, chọn đối tượng, thêm câu hỏi (Likert/Trắc nghiệm/Tự luận) → Lưu
4. Click icon **"Xem thống kê"** → Xem Dashboard biểu đồ phân bố kết quả
5. Xuất báo cáo: Click menu xuất file → Chọn **Excel**, **Word** hoặc **PDF**
6. Tab **"Quản lý người dùng"** → Thay đổi vai trò tài khoản bất kỳ

### 3. Luồng Cán bộ Quản lý
1. Đăng nhập với `manager@edu.vn` / `12345678`
2. Xem Dashboard thống kê biểu đồ theo thời gian thực
3. Xuất các báo cáo minh chứng kiểm định (Excel/Word/PDF)

### 4. Luồng Đăng nhập Google
1. Tại trang Đăng nhập → Click **"Đăng nhập bằng tài khoản Google thực"**
2. Nếu đã cấu hình `VITE_GOOGLE_CLIENT_ID`: Mở popup OAuth của Google, chọn tài khoản
3. Nếu chưa cấu hình: Hiển thị modal nhập email + họ tên Google thủ công
4. Hệ thống tự động tạo tài khoản (nếu chưa có) và đăng nhập

### 5. Luồng Quên mật khẩu
1. Tại trang Đăng nhập → Click **"Quên mật khẩu?"**
2. Nhập email đã đăng ký → Hệ thống gửi mã OTP 6 số qua email
3. Nhập mã OTP → Đặt mật khẩu mới → Đăng nhập lại

---

## 📊 Dữ Liệu Mẫu Đã Seed Sẵn

Hệ thống tự động seed **4 cuộc khảo sát** thực tế kèm câu hỏi và dữ liệu phản hồi mẫu:

| # | Tên khảo sát | Đối tượng | Số câu hỏi | Phản hồi mẫu |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Khảo sát Ý kiến Sinh viên về Chất lượng Môn học & Giảng dạy | Sinh viên | 5 | 10 |
| 2 | Khảo sát Điều kiện Giảng dạy & Hỗ trợ Chuyên môn cho Giảng viên | Giảng viên | 4 | 0 |
| 3 | Khảo sát Tình hình Việc làm & Đánh giá CTĐT sau Tốt nghiệp | Cựu sinh viên | 4 | 0 |
| 4 | Khảo sát Doanh nghiệp tuyển dụng về Chất lượng SVTN | Nhà tuyển dụng | 5 | 3 |

---

## 📜 License

© 2026 Academic Synergy — Phần mềm khảo sát ý kiến các bên liên quan trong giáo dục.
