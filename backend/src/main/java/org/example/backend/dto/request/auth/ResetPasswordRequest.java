package org.example.backend.dto.request.auth;

public record ResetPasswordRequest(String email, String otp, String newPassword) {
}
