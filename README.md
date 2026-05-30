# 🎓 Phần Mềm Khảo Sát Lấy Ý Kiến Các Bên Liên Quan Trong Giáo Dục (Topic 2)

Dự án được xây dựng dựa trên tài liệu mô tả chức năng của SDC, phục vụ kiểm định chất lượng giáo dục theo chuẩn AUN-QA và ABET. Hệ thống hỗ trợ đa đối tượng sử dụng (Sinh viên, Giảng viên, Cựu sinh viên, Nhà tuyển dụng, Cán bộ quản lý và Admin).

Hệ thống được thiết kế theo phong cách **Premium Glassmorphism** hiện đại, responsive hoàn hảo và hỗ trợ trực quan hóa dữ liệu qua biểu đồ cùng tính năng xuất báo cáo chuyên nghiệp.

---

## 🛠️ Công Nghệ Sử Dụng

### 1. Frontend (`/frontend`)
- **ReactJS (Vite)**: SPA mượt mà, tối ưu hiệu năng tải trang.
- **TailwindCSS**: CSS Utility-first cùng biến màu tùy chỉnh cho hiệu ứng chuyển màu cao cấp.
- **Lucide Icons**: Bộ icon hiện đại, sắc nét.
- **Chart & Analytics**: Biểu đồ hiển thị kết quả phân bố câu trả lời trực quan theo thời gian thực.
- **Auto-Save**: Tự động lưu tiến trình làm khảo sát vào `localStorage` phòng trường hợp mất mạng/đóng tab.

### 2. Backend (`/backend`)
- **ExpressJS**: Lập trình API RESTful tinh gọn.
- **Sequelize ORM**: Quản lý cơ sở dữ liệu đồng bộ.
- **SQLite Database**: Mặc định cho môi trường phát triển giúp **chạy ngay lập tức** mà không cần cấu hình MySQL phức tạp (Mã nguồn ORM dễ dàng cấu hình chuyển đổi sang MySQL/PostgreSql chỉ trong 3 dòng tại file `.env`).
- **JWT Authentication & RBAC**: Xác thực qua token lưu ở Client và phân quyền vai trò người dùng (Admin / Manager / Student / Lecturer / Alumnus / Employer).
- **ExcelJS**: Trích xuất dữ liệu kết quả khảo sát ra file Excel chuyên nghiệp (phục vụ lưu trữ minh chứng kiểm định).

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
| **Cán bộ quản lý** | `manager@edu.vn` | Trần Cán Bộ | Xem Dashboard thống kê biểu đồ, xuất file báo cáo Excel |
| **Sinh viên** | `student1@edu.vn` | Trần Kim Liên | Làm khảo sát dành cho Sinh viên |
| **Sinh viên** | `student2@edu.vn` | Nguyễn Văn Tuấn | Làm khảo sát dành cho Sinh viên |
| **Giảng viên** | `lecturer1@edu.vn` | Phạm Giảng Viên | Làm khảo sát dành cho Giảng viên |
| **Cựu sinh viên** | `alumnus1@edu.vn` | Hoàng Cựu SV | Làm khảo sát đánh giá CTĐT sau ra trường |
| **Nhà tuyển dụng** | `employer1@edu.vn` | FPT Software | Đánh giá chất lượng sinh viên tốt nghiệp |

---

## 📋 Các Quy Trình Thử Nghiệm Điển Hình (Luồng E2E)

1. **Đăng nhập vai trò Sinh viên (`student1@edu.vn`):** Vào mục khảo sát được phân công, thực hiện điền các thang điểm Likert và ý kiến, gửi thành công.
2. **Đăng nhập vai trò Admin (`admin@edu.vn`):** 
   - Click **"Tạo Khảo Sát Mới"**, nhập tiêu đề, đối tượng SV/GV, thêm các câu hỏi trắc nghiệm/Likert/tự luận tùy ý và lưu lại.
   - Chuyển sang tab **"Quản lý phân quyền"**, thay đổi vai trò tài khoản bất kỳ trực tiếp và xem sự thay đổi quyền hạn lập tức.
3. **Đăng nhập vai trò Cán bộ quản lý (`manager@edu.vn`):**
   - Click nút **"Xem thống kê (biểu tượng hình con mắt)"** ở cuộc khảo sát Sinh viên -> Xem Dashboard biểu đồ phân bố và điểm trung bình Likert tính toán theo thời gian thực.
   - Click nút **"Xuất Excel (biểu tượng bảng tính)"** -> Tải xuống file báo cáo Excel được định dạng chuyên nghiệp gồm Sheet Tổng quan và Sheet Kết quả chi tiết từng người trả lời để nộp minh chứng kiểm định.
