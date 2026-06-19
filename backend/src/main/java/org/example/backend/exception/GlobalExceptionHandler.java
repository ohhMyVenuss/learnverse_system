package org.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Bắt lỗi logic nghiệp vụ (Ví dụ: Email trùng, Không tìm thấy bài viết...)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // 2. Bắt lỗi QUYỀN TRUY CẬP (Cái bạn đang cần)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedException(AccessDeniedException ex) {
        // Trả về câu thông báo rõ ràng thay vì im lặng
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("🚫 Từ chối truy cập! Bạn không có quyền thực hiện hành động này (Cần quyền ADMIN hoặc TEACHER).");
    }

    // 3. Bắt các lỗi khác (Lỗi hệ thống)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnwantedException(Exception ex) {
        ex.printStackTrace(); // In lỗi ra console để dev sửa
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống không xác định");
    }
}