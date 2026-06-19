# Cẩm Nang Quy Trình Hoạt Động & Nghiệp Vụ Hệ Thống Learnverse V2

Tài liệu này trình bày chi tiết về kiến trúc hệ thống, luồng xử lý nghiệp vụ cốt lõi, và sự tương tác qua lại giữa ba thành phần chính của dự án Learnverse V2: **Backend (Spring Boot)**, **Mobile Client (Android Jetpack Compose)**, và **Admin/Instructor Web (React + Vite)**.

---

## 1. Tổng Quan Kiến Trúc Hệ Thống (System Architecture)

Hệ thống hoạt động theo mô hình **Client-Server** kết hợp cơ chế lưu trữ ngoại tuyến tại chỗ (Offline-First) trên ứng dụng di động:

```mermaid
graph TD
    subgraph Client Layer
        Android[Android App - Students]
        WebAdmin[React Web - Admins / Instructors]
    end

    subgraph Service & Gateway Layer
        API[Spring Boot REST API]
        Security[Spring Security & JWT]
        AI[AI Quiz Generator Service]
    end

    subgraph Data Layer
        DB[(Neon PostgreSQL Database)]
        LocalSP[(Android SharedPreferences - Notes/Schedules)]
    end

    Android <-->|REST API + Bearer JWT| Security
    WebAdmin <-->|REST API + Bearer JWT| Security
    Security <--> API
    API <--> DB
    Android <-->|Offline Local Storage| LocalSP
```

---

## 2. Các Quy Trình Nghiệp Vụ Cốt Lõi & Luồng Tương Tác

### Chức năng 1: Quy Trình Xác Thực (Authentication & Security)

Hệ thống sử dụng cơ chế xác thực không trạng thái (Stateless) dựa trên **JWT Token** kết hợp gửi mã xác thực **OTP qua Email** để khôi phục mật khẩu hoặc xác thực tài khoản.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (Mobile/Web)
    participant Client as Ứng dụng Client
    participant AuthAPI as Auth Controller (Spring Boot)
    participant Mail as Email Service
    participant DB as PostgreSQL Database

    User->>Client: Điền thông tin đăng nhập/đăng ký
    Client->>AuthAPI: POST /api/auth/register hoặc /login
    AuthAPI->>DB: Truy vấn & Lưu thông tin người dùng
    alt Đăng ký thành công & Yêu cầu OTP
        AuthAPI->>Mail: Kích hoạt gửi mã OTP qua Gmail
        Mail-->>User: Gửi mã OTP vào hộp thư
        User->>Client: Nhập mã OTP
        Client->>AuthAPI: POST /api/auth/verify-otp
        AuthAPI->>DB: Đánh dấu active tài khoản
    end
    AuthAPI-->>Client: Trả về JWT Token + Thông tin cơ bản
    Client->>Client: Lưu JWT vào bộ nhớ bảo mật (SharedPreferences/LocalStorage)
```

> [!NOTE]
> Mọi yêu cầu HTTP gửi đến các tài nguyên được bảo vệ (sau đăng nhập) bắt buộc phải đính kèm Header:
> `Authorization: Bearer <JWT_TOKEN>`

---

### Chức năng 2: Đăng Ký Khóa Học & Quy Trình Thanh Toán (Payments & Enrollment)

Learnverse V2 hỗ trợ đăng ký và mua khóa học bằng hệ thống giả lập thanh toán (Mock Payment Gateway), tự động kích hoạt quyền học tập ngay khi giao dịch thành công.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Học viên (Android)
    participant App as Android Client
    participant PayAPI as Payment Controller
    participant CourseAPI as Course Controller
    participant DB as PostgreSQL Database

    Student->>App: Chọn mua khóa học (Java, Python,...)
    App->>PayAPI: POST /api/payments (Gửi PaymentRequestDto)
    PayAPI->>DB: Tạo bản ghi thanh toán trạng thái PENDING
    PayAPI-->>App: Trả về thông tin hóa đơn (orderCode, giá tiền)
    App->>App: Hiển thị giao diện chuyển khoản giả lập
    Student->>App: Xác nhận đã chuyển khoản thành công
    App->>PayAPI: (Giả lập callback) Cập nhật trạng thái giao dịch
    PayAPI->>DB: Cập nhật trạng thái Payment -> SUCCESS
    PayAPI->>DB: Tự động ghi danh (Tạo bản ghi trong table Enrollments)
    PayAPI-->>App: Trả về trạng thái SUCCESS
    App->>CourseAPI: GET /api/courses/my-courses (Tải lại danh sách khóa học)
    CourseAPI-->>App: Trả về danh sách đã bao gồm khóa học mới mua
    App->>Student: Hiển thị khóa học trong thư viện "My Courses"
```

---

### Chức năng 3: Không Gian Học Tập Tích Hợp (Course Study Workspace)

Nơi học viên tương tác trực tiếp với bài học, bao gồm: xem video bài học, làm thẻ ghi nhớ (Flashcards), và thực hiện các bài thi trắc nghiệm (Quizzes).

```mermaid
graph LR
    Workspace[Study Workspace Screen]
    
    Workspace -->|1. Phát Video| Video[ExoPlayer Player]
    Workspace -->|2. Học tập chủ động| Flashcard[3D Flip-Card Component]
    Workspace -->|3. Kiểm tra kiến thức| Quiz[Interactive Quiz Engine]
    
    Flashcard -->|Đánh dấu 'Chưa hiểu'| Notes[Study Notes tab]
    Quiz -->|Kết quả sai| Notes
```

* **Video Player (ExoPlayer)**: Tự động tải luồng phát video từ bài học được chọn, giúp duy trì trạng thái phát ổn định.
* **3D Flip-Card**: Cho phép học viên lật thẻ ghi nhớ để xem đáp án/giải thích và đánh dấu thẻ ở trạng thái "Chưa hiểu". Trạng thái này lập tức được lưu vào danh mục **Ghi chú học tập** để ôn tập lại sau.

---

### Chức năng 4: Hệ Thống Ghi Chú & Lịch Trình Tương Tác Lịch Học (Advanced Notes & Google Calendar Sync)

Đây là chức năng quan trọng hỗ trợ lưu trữ Offline-First, hiển thị trực quan dạng Google Calendar và tự động kích hoạt báo thức/thông báo trên điện thoại.

```mermaid
graph TD
    User([Học viên]) -->|Tạo Lịch Trình| AppUI[Android UI: Calendar & Note Form]
    AppUI -->|Lưu cục bộ| NotesManager[NotesManager object]
    NotesManager -->|1. Lưu SharedPreferences| LocalSP[(SharedPreferences)]
    NotesManager -->|2. Gọi API đồng bộ| Retrofit[Retrofit ApiService]
    Retrofit -->|POST /api/user-notes| Server[Spring Boot Backend]
    Server -->|Lưu DB| DB[(PostgreSQL)]
    
    NotesManager -->|3. Đăng ký nhắc nhở| Alarm[AlarmScheduler]
    Alarm -->|Thiết lập RTC_WAKEUP| AlarmManager[Android System AlarmManager]
    AlarmManager -->|Đến giờ hẹn| Broadcast[AlarmReceiver]
    Broadcast -->|Đẩy thông báo| Notif[Android NotificationManager]
```

#### Quy Trình Đồng Bộ & Xử Lý Sự Cố:
1. **Lưu trữ ngoại tuyến:** Khi học viên nhấn "Lưu", lịch trình sẽ được lưu ngay vào `SharedPreferences` cục bộ để đảm bảo tốc độ phản hồi tức thì và hỗ trợ sử dụng ngoại tuyến.
2. **Đồng bộ Server:** Ứng dụng gửi yêu cầu lưu từ xa qua API. Nếu Server trả về thành công, ID tạm thời (`"0"`) sẽ được thay thế bằng ID chính thức của cơ sở dữ liệu từ Server.
3. **Quản lý lịch nhắc nhở (Alarms):** Lịch trình được đăng ký trực tiếp với hệ điều hành Android qua `AlarmManager`. Khi đến đúng thời gian hẹn, hệ thống sẽ phát tín hiệu kích hoạt `BroadcastReceiver` và hiển thị thông báo đầu màn hình (Push Notification).
4. **Google Calendar View (Lịch biểu đánh dấu ngày):**
   * Hệ thống tự động phân loại các ngày có sự kiện và vẽ các chấm tròn màu sắc tương ứng dưới ô ngày đó (Đỏ = Quan trọng cao, Cam = Trung bình, Xám = Thấp).
   * Lọc thông minh: Nhấp vào một ngày cụ thể trên lưới lịch, danh sách ghi chú bên dưới sẽ lọc ra đúng các lịch trình tương ứng của ngày đó.

---

### Chức năng 5: Động Cơ Trắc Nghiệm AI & Quản Lý Bài Tập (AI Quiz Engine)

Giảng viên có thể tải lên tệp tài liệu tài nguyên bài giảng (PDF/TXT), hệ thống Web Admin sẽ gửi yêu cầu xử lý sang Backend để trích xuất nội dung và dùng mô hình AI tự động sinh câu hỏi trắc nghiệm.

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giảng viên (React Web)
    participant Web as Web Admin (React)
    participant Backend as Spring Boot API
    participant AI as AI Service (Mock/API)
    participant DB as PostgreSQL Database

    Teacher->>Web: Tải lên tài liệu PDF bài học
    Web->>Backend: POST /api/quizzes/generate (Gửi tệp đính kèm)
    Backend->>AI: Gửi nội dung tài liệu yêu cầu sinh câu hỏi
    AI-->>Backend: Trả về danh sách câu hỏi & đáp án gợi ý (JSON)
    Backend->>DB: Lưu Quiz mới cùng các Questions & AnswerOptions
    Backend-->>Web: Hiển thị danh sách câu hỏi đã sinh ra
    Teacher->>Web: Chỉnh sửa lại các câu hỏi nếu cần và nhấn "Publish"
    Web->>Backend: PUT /api/quizzes/{id}/publish
    Backend->>DB: Đổi trạng thái Quiz sang isPublic = true
```

---

## 3. Bản Đồ Tương Tác API & Thực Thể Dữ Liệu (API & Entity Mapping Matrix)

Bảng dưới đây thống kê mối tương quan giữa giao diện Người dùng, API Endpoint và các bảng thực thể được thao tác trong cơ sở dữ liệu PostgreSQL:

| Tên Chức Năng | API Endpoint (Backend) | Method | Giao Diện Tương Tác | Bảng CSDL Ảnh Hưởng |
| :--- | :--- | :--- | :--- | :--- |
| **Đăng nhập & Đăng ký** | `/api/auth/login`<br>`/api/auth/register`<br>`/api/auth/verify-otp` | POST | Màn hình Login, SignUp, Verify OTP | `users`, `user_profiles` |
| **Mua khóa học** | `/api/payments` | POST | Màn hình Chi tiết khóa học (Android) | `payments` |
| **Xem danh sách học** | `/api/courses/my-courses` | GET | Tab Home / Courses (Android) | `enrollments`, `courses` |
| **Xem bài học & Video**| `/api/courses/{id}/lessons` | GET | Màn hình Course Study Workspace | `lessons` |
| **Ghi chú bài học** | `/api/notes` | POST/GET | Giao diện ghi chú dưới video bài học | `notes` |
| **Lấy danh sách Quiz** | `/api/quizzes` | GET | Tab Trắc nghiệm học tập | `quizzes`, `questions` |
| **Làm bài Trắc nghiệm**| `/api/quizzes/{id}/start`<br>`/api/quizzes/attempts/{id}/complete` | POST | Giao diện Quiz play | `quiz_attempts` |
| **Đồng bộ Lịch trình**| `/api/user-notes` | GET/POST | Tab Lịch trình (Android) | `user_notes` |
| **Tạo/Sửa Lịch trình** | `/api/user-notes/{id}` | PUT/DELETE | Nút dấu cộng mở rộng (FAB) / Lịch | `user_notes` |
| **Tạo Khóa học (GV)** | `/api/courses` | POST | Trang Instructor Dashboard (React Web) | `courses` |
| **Duyệt Khóa học (AD)**| `/api/courses/{id}/approve` | PUT | Trang Admin Dashboard (React Web) | `courses`, `notifications` |

---

## 4. Cơ Chế Bảo Mật & Phân Quyền (Security & Role Management)

Hệ thống quản lý phân quyền chặt chẽ trên Spring Security thông qua cột `role` trong thực thể `User` (`Role.ADMIN`, `Role.TEACHER`, `Role.STUDENT`):

* **Học viên (`STUDENT`)**: Có quyền xem các khóa học đã được phê duyệt (`APPROVED`), ghi danh học tập, thực hiện trắc nghiệm, tạo lịch trình cá nhân, và viết ghi chú.
* **Giảng viên (`TEACHER`)**: Có quyền tạo khóa học mới, tải bài giảng lên, sinh trắc nghiệm tự động bằng AI từ tài liệu bài giảng, và theo dõi danh sách học viên đăng ký.
* **Quản trị viên (`ADMIN`)**: Có toàn quyền hệ thống, phê duyệt hoặc từ chối các khóa học mới tải lên của giảng viên, quản lý tài khoản người dùng, và xem báo cáo thống kê doanh thu giao dịch.
