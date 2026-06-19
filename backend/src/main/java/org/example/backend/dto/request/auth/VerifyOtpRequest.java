package org.example.backend.dto.request.auth;

public record VerifyOtpRequest(String email, String otp) {}
