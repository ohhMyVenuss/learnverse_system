Đây là kho lưu trữ front-end cho dự án LearnVerse, được xây dựng bằng React và Vite. Dự án này bao gồm luồng giao diện người dùng hoàn chỉnh cho việc xác thực (Đăng nhập, Đăng ký, Quên mật khẩu, v.v.).

## Công nghệ sử dụng

* **React 18**
* **Vite** (Build tool thế hệ mới)
* **React Router v6** (Để định tuyến trang)
* **Tailwind CSS** (Utility-first CSS framework)
* `@tailwindcss/forms` (Để tùy chỉnh checkbox)
* `react-icons` (Cho các biểu tượng)

---

## 1. Yêu cầu Cài đặt & Khởi động Dự án

### A. Yêu cầu Tiên quyết (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:

- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản **18+**)  
- [npm](https://www.npmjs.com/) (đi kèm với Node.js)  
- [Git](https://git-scm.com/)

---

### B. Khởi chạy Lần đầu

Thực hiện các bước sau trong Terminal:

```bash
# 1️⃣ Clone Repository
git clone https://github.com/ohhMyVenuss/Crop-Wise-Project.git

# 2️⃣ Di chuyển vào thư mục dự án
cd CropWise

# 3️⃣ Cài đặt các gói phụ thuộc
npm install

# 4️⃣ Khởi động máy chủ phát triển
npm run dev
```
---

## 2. Quy tắc Làm việc Nhóm (Git Flow)

Dự án tuân thủ **GitHub Flow** để đảm bảo quy trình làm việc mạch lạc, dễ theo dõi và tránh xung đột.

---

### A. Nhánh Chính (Main Branch)

- **Tên:** `main`  
- **Mục đích:** Chứa code ổn định, đã kiểm thử và sẵn sàng triển khai (**Production-ready**).  
- **Quy tắc:** *Không commit trực tiếp vào nhánh `main`.*

---

### B. Quy trình Làm việc Chuẩn

#### 1️⃣ Bắt đầu Công việc

Luôn cập nhật nhánh `main` trước khi tạo nhánh mới để tránh xung đột:

```bash
git checkout main
git pull origin main
```
Tạo một nhánh mới (tên nhánh mô tả rõ công việc):

```bash
git checkout -b feature/ten-tinh-nang-cua-ban
# Ví dụ: git checkout -b fix/auth-form-validation
```

#### 2️⃣ Commit & Đồng bộ (Push)

Sau khi hoàn thành công việc hoặc muốn sao lưu tiến trình:

```bash
# Thêm file thay đổi
git add .

# Commit theo quy ước (xem Mục 3)
git commit -m "feat: Them form dang nhap cho nguoi dung"

# Đẩy nhánh lên GitHub
git push origin feature/ten-tinh-nang-cua-ban
```
#### 3️⃣ Tạo Pull Request (PR)

#### Truy cập GitHub → Tạo Pull Request (PR) từ nhánh tính năng sang main.

#### Bắt buộc Review: Một thành viên khác trong nhóm phải xem xét code.

#### Merge: Chỉ được hợp nhất sau khi:

#### Đã được phê duyệt (✅ Approved).

#### Đã giải quyết xong mọi xung đột (nếu có).
## 3. Cấu trúc thư mục chính

```bash
src/
├── assets/         # Chứa hình ảnh (PNG, SVG), fonts...
├── components/     # Các component "ngu ngốc" tái sử dụng (Button, InputField, AuthLayout)
├── contexts/       # (Tương lai) Dùng cho Global State (ví dụ: Context API)
├── hooks/          # (Tương lai) Dùng cho các custom hooks
├── pages/          # Các component "thông minh", đại diện cho 1 trang (LoginPage, RegisterPage...)
├── services/       # (Tương lai) Nơi chứa logic gọi API
├── App.jsx         # Cài đặt React Router (định nghĩa các tuyến đường)
├── main.jsx        # Điểm vào (entry point) của React
└── index.css       # Các chỉ thị (directives) toàn cục của Tailwind

```



```
