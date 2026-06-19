package org.example.backend.dto.response.auth;

public record ForgotPasswordResponse(String email, String otp, String message) {
}
