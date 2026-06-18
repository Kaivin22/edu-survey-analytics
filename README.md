# Phan mem Khao sat Lay y kien Cac ben Lien quan Trong Giao duc
Du an duoc xay dung dua tren tai lieu mo ta chuc nang cua SDC, phuc vu kiem dinh chat luong giao duc theo chuan AUN-QA va ABET. He thong ho tro da doi tuong su dung bao gom Sinh vien, Giang vien, Cuu sinh vien, Nha tuyen dung, Can bo quan ly va Admin.

He thong duoc thiet ke theo phong cach Premium Glassmorphism hien dai, responsive hoan hao va ho tro truc quan hoa du lieu qua bieu do cung tinh nang xuat bao cao chuyen nghiep.

---

## Tinh nang Chinh

- Trang gioi thieu: Trang Landing da section (Hero, Gioi thieu, Doi tuong, Lien he, Footer) voi video background sac net.
- Dang nhap va Dang ky: Form xac thuc truyen thong qua email va mat khau voi video background sinh dong.
- Dang nhap Google OAuth 2.0: Tich hop Google Implicit Flow hoac nhap email Google thu cong (fallback) khi chua cau hinh Client ID.
- Quen mat khau: Gui ma OTP thuc qua email (SMTP) de dat lai mat khau. He thong tu dong ho tro hien thi OTP truc tiep tren giao dien neu SMTP chua duoc thiet lap hoac xay ra loi ket noi.
- Chinh sua thong tin ca nhan: Chinh sua ho ten, ma nhan dien, va doi mat khau (ngoai tru cac tai khoan he thong demo).
- Dashboard Admin va Manager: Quan ly khao sat, xem thong ke bieu do phan bo ket qua theo thoi gian thuc, quan ly danh sach nguoi dung.
- Dashboard Stakeholder: Danh sach khao sat duoc phan cong, thuc hien lam khao sat, xem cac thong bao moi nhan duoc.
- Xuat bao cao da dang: Ho tro xuat bieu mau khao sat theo 3 dinh dang bao gom Excel (.xlsx), Word (.docx) va PDF (.pdf) - ho tro day du phong chu tieng Viet.
- He thong thong bao: Tu dong gui thong bao khi co khao sat moi hoac nhac nho thoi han khao sat.
- Tu dong luu tien trinh (Auto-Save): Tu dong luu tien do lam khao sat cua stakeholder vao localStorage de tranh mat du lieu khi gap su co mat ket noi.
- Dieu huong thong minh: Luon co nut quay tro lai Trang chu tren tat ca cac trang; thanh Navbar hien thi thong tin va trang thai dang nhap ro rang.

---

## Cong nghe Su dung

### 1. Giao dien (thumuc frontend)
- ReactJS (Vite): SPA muot ma, tang toc do tai trang va toi uu trai nghiem.
- TailwindCSS: CSS Utility-first ket hop cac bien mau tuy bien de tao hien thi cao cap.
- Lucide Icons: Thu vien icon don gian va sac net.
- Chart and Analytics: Ve bieu do phan bo va ty le phan hoi thoi gian thuc tren giao dien quan tri.
- Google OAuth 2.0: Dang nhap bang tai khoan Google thuc hoac phuong an du phong nhap thu cong.

### 2. May chu (thumuc backend)
- ExpressJS: Xay dung API RESTful nhanh gon.
- Sequelize ORM: Dong bo hoa va truy van co so du lieu an toan.
- SQLite Database: Su dung mac dinh cho moi truong lap trinh, khong yeu cau cai dat he quan tri co so du lieu phuc tap (co the chuyen sang MySQL/PostgreSQL de dang thong qua file .env).
- JWT Authentication va RBAC: Bao mat he thong bang Token va phan quyen vai tro (Admin, Manager, Student, Lecturer, Alumnus, Employer).
- Nodemailer: Gui ma xac nhan OTP thuc qua moi truong mail.
- ExcelJS: Thu vien tao file bao cao Excel.
- docx: Thu vien tao van ban Word dinh dang bang.
- PDFKit: Thu vien tao file PDF tieng Viet co nhung san phong chu Arial.

---

## Huong dan Khoi chay Du an

### Phuong phap 1: Su dung Docker (Khuyen khich)
Yeu cau: May tinh da cai dat va dang chay Docker Desktop.

1. Mo Terminal hoac PowerShell tai thu muc goc cua du an.
2. Chay lenh sau de tu dong tai thu vien, dung va ket noi cac container:
   ```bash
   docker-compose up --build
   ```
3. Truy cap he thong qua cac dia chi:
   - Frontend App: http://localhost:3000
   - Backend API: http://localhost:5000/api
4. De dung container, dung lenh:
   ```bash
   docker-compose down
   ```

### Phuong phap 2: Chay truc tiep tren may cuc bo (Local)
Yeu cau: May tinh da cai dat Node.js phien ban v18.x tro len.

1. Mo terminal tai thu muc goc cua du an va chay lenh de cai dat thu vien cho ca FE va BE:
   ```bash
   npm run install-all
   ```
2. Chay dong thoi ca hai phan bang lenh:
   ```bash
   npm run dev
   ```
3. Truy cap ung dung theo cac dia chi:
   - Giao dien: http://localhost:3000
   - API: http://localhost:5000

---

## Tai khoan Thu nghiem (Auto-Seeded)

Co so du lieu se tu dong khoi tao san cac vai tro, danh muc khoa va lop cung nhu tai khoan va khao sat mau.

Mat khau chung cho tat ca cac tai khoan mac dinh la: 12345678

| Vai tro | Email dang nhap | Ten nguoi dung | Muc dich thu nghiem |
| :--- | :--- | :--- | :--- |
| Quan tri vien (Admin) | trankimlien31072004@gmail.com | Nguyen Quan Tri | Quan ly nguoi dung, phan quyen, khao sat toan he thong |
| Can bo quan ly | manager@edu.vn | Tran Can Bo | Tao, chinh sua, xoa va xem thong ke khao sat trong truong duoc phan cong |
| Sinh vien | student1@edu.vn | Tran Kim Lien | Lam khao sat danh cho Sinh vien |
| Sinh vien | student2@edu.vn | Nguyen Van Tuan | Lam khao sat danh cho Sinh vien |
| Giang vien | lecturer1@edu.vn | Pham Giang Vien | Giang vien lam khao sat duoc phan cong |
| Cuu sinh vien | alumnus1@edu.vn | Hoang Cuu SV | Cuu sinh vien lam khao sat CTDT sau ra truong |
| Nha tuyen dung | employer1@edu.vn | FPT Software | Nha tuyen dung danh gia chat luong sinh vien tot nghiep |

Ngoai ra, ban co the dang ky tai khoan moi hoac su dung phuong thuc dang nhap Google de tu dong tao tai khoan thuc.

---

## Cau hinh Bien moi truong

### Backend (backend/.env)
```env
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./data/database.sqlite
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000

# SMTP de gui mail OTP thuc (Thay doi thong tin thuc cua ban)
# Luu y ve SMTP_PASS: Phai su dung Mat khau ung dung (App Password) cua Google. Hay viet lien 16 ky tu chu thuong, xoa toan bo khoang trang de Nodemailer nhan dien dung (vi du: abcdefghijklmnop).
# Luu y ve SMTP_PORT: Tren moi truong production (Render), hay dung cong 465 (voi secure = true) thay vi cong 587, vi cac nha cung cap cloud nhu Render se chan cong 587 de phong ngua spam.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=email-gui-mail-cua-ban@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=Academic Synergy <email-gui-mail-cua-ban@gmail.com>
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:5000/api

# Google OAuth 2.0 (tuy chon)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Neu thong tin Google Client ID de trong, nut dang nhap bang Google se tu dong ve che do fallback nhap tay ho ten va email.

---

## Cau truc Du an

```
edu-survey-analytics/
├── docker-compose.yml        # File khoi chay he thong dong thoi FE va BE
├── package.json              # File chua scripts khoi chay chung
├── README.md                 # Huong dan su dung nay
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf            # Cau hinh may chu Nginx phuc vu SPA
│   ├── src/
│   │   ├── App.jsx           # Cau hinh routing va luu trang thai xac thuc
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Trang landing page gioi thieu he thong
│   │   │   ├── Login.jsx         # Trang dang nhap he thong
│   │   │   ├── Register.jsx      # Trang dang ky tai khoan
│   │   │   ├── ForgotPassword.jsx# Trang quen mat khau va nhap OTP
│   │   │   ├── Dashboard.jsx     # Dashboard chung cho cac Stakeholder
│   │   │   ├── AdminDashboard.jsx# Dashboard danh cho Admin va Manager
│   │   │   ├── SurveyCreation.jsx# Giao dien tao hoac sua khao sat (Admin/Manager)
│   │   │   ├── SurveyTaking.jsx  # Giao dien thuc hien lam khao sat
│   │   │   └── SurveyStats.jsx   # Giao dien xem thong ke bieu do va ket qua
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── Dockerfile
│   ├── server.js              # Diem khoi chay backend, dong bo DB va tao admin mac dinh
│   ├── config/
│   │   └── db.js              # Ket noi co so du lieu Sequelize
│   ├── models/                # Dinh nghia cac thuc the du lieu (Role, User, Survey,...)
│   ├── routes/
│   │   ├── auth.js            # Xu ly dang nhap, dang ky, doi thong tin, quen mat khau
│   │   ├── surveys.js         # API quan ly khao sat, lay chi tiet va thuc hien submit
│   │   ├── users.js           # API quan ly tai khoan va gui thong bao
│   │   └── reports.js         # API xuat bao cao dinh dang Excel, Word va PDF
│   ├── middleware/
│   │   └── auth.js            # Middleware xac thuc Token va kiem tra quyen vai tro
│   ├── scripts/
│   │   └── initDb.js          # Seed du lieu mac dinh ban dau
│   ├── fonts/                 # Thu muc chua font chu Arial tieng Viet phuc vu PDF
│   └── package.json
```

---

## Cac Quy trinh Thuy nghiem Chinh

### 1. Quy trinh nguoi lam khao sat (Stakeholder)
1. Truy cap he thong va chon nut Tham gia khao sat.
2. Dang nhap bang mot tai khoan duoc cap (nhu student1@edu.vn) hoac dang nhap bang Google.
3. Tai trang chu, chon mot cuoc khao sat dang mo de lam.
4. Tra loi cac cau hoi tu luan va trac nghiem, sau do nhan Gui phan hoi.
5. Co the vao tab Thong tin ca nhan de chinh sua thong tin ca nhan cua minh.

### 2. Quy trinh nguoi quan tri (Admin/Manager)
1. Dang nhap bang tai khoan admin (trankimlien31072004@gmail.com) hoac tai khoan manager.
2. Trang dashboard hien thi toan bo khao sat thuoc pham vi quan ly.
3. Chon nut Tao khao sat moi de thiet ke khao sat (tieu de, doi tuong nhan, cau hoi).
4. Quan ly khao sat da tao bang cach bam cac bieu tuong xem thong ke bieu do, sua, xoa.
5. Xuat báo cáo bang cach chon cac dinh dang Excel, Word hoac PDF.
6. Rieng voi Admin co the quan ly va thiet lap vai tro nguoi dung o tab Quan ly nguoi dung.

### 3. Quy trinh quen mat khau
1. Tai trang dang nhap, nhan vao nut Quen mat khau.
2. Nhap email da dang ky tai khoan de lay ma OTP (OTP thuc hoac OTP thong bao tren man hinh).
3. Nhap ma OTP va mat khau moi de thay doi mat khau va dang nhap lai he thong.

---

## Tich hop CI/CD (GitHub Actions)

Du an duoc tich hop san quy trinh Tich hop va Trien khai lien tuc (CI/CD) tu dong qua GitHub Actions (cau hinh tai file `.github/workflows/ci-cd.yml`).
- Tinh nang CI (Continuous Integration): Moi khi push code hoac tao Pull Request len nhanh main va feature/tuan, GitHub Actions se khoi chay tu dong:
  1. Thiet lap moi truong Node.js 20.
  2. Cai dat thu vien va tien hanh build kiem thu toan bo frontend de dam bao khong co loi bien dich JS/JSX.
  3. Cai dat thu vien backend va tu dong chay kiem tra cu phap (syntax checks) tat ca cac file routes va server tren backend bang trinh bien dich node de ngan chan cac loi runtime hoac khai bao trung lap identifier truoc khi deploy.
- Tinh nang CD (Continuous Deployment): Sau khi phan kiem thu tu dong (CI) hoan tat va pass tat ca cac buoc, kho chua se tu dong trien khai deploy phien ban moi nhat len may chu Render de nguoi dung luon trai nghiem ban cap nhat on dinh nhat.

---

## Giay phep su dung

Ban quyen thuoc ve Academic Synergy - Ung dung khao sat lay y kien cac ben lien quan trong giao duc.
