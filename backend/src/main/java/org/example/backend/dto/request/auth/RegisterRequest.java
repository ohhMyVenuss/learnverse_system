package org.example.backend.dto.request.auth;

public record RegisterRequest(String email, String password, String fullName, String role) {
}
