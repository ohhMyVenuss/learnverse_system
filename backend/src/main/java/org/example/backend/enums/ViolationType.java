package org.example.backend.enums;

public enum ViolationType {
    // 1. Nhóm hành vi cửa sổ (Quan trọng nhất)
    TAB_SWITCH,         // Chuyển sang tab khác (Visibility API)
    WINDOW_BLUR,        // Mất tiêu điểm: Click sang ứng dụng khác như Zalo/Mess (Blur API)
    FULLSCREEN_EXIT,    // Thoát chế độ toàn màn hình (Fullscreen API) // cho chuyen tab

    // 2. Nhóm hành vi chuột/tương tác
    MOUSE_LEAVE,        // Di chuột ra khỏi vùng hiển thị (ví dụ di lên thanh URL)
    CONTEXT_MENU,       // Cố tình bấm chuột phải (để Inspect hoặc Copy)

    // 3. Nhóm hành vi sao chép (Chống leak đề)
    COPY_ATTEMPT,       // Cố tình Copy nội dung câu hỏi
    PASTE_ATTEMPT,      // Cố tình Paste nội dung từ ngoài vào ô trả lời

    // 4. Nhóm hệ thống (Nâng cao)
    DEV_TOOLS_OPEN,     // Phát hiện mở F12/Developer Tools (Khó bắt, nhưng có thể thử)
    WINDOW_RESIZE,      // Thu nhỏ trình duyệt để dùng song song với cửa sổ khác

    // 5. Dự phòng
    UNKNOWN             // Lỗi không xác định
}