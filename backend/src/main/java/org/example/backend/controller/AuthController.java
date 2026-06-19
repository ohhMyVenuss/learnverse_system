package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.auth.LoginRequest;
import org.example.backend.dto.request.auth.RegisterRequest;
import org.example.backend.dto.response.auth.LoginResponse;
import org.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        System.out.println("Dang login: " + request);
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        System.out.println("dang regis: " + request);
        authService.register(request);
        return ResponseEntity.ok("Đăng ký thành công");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<org.example.backend.dto.response.auth.ForgotPasswordResponse> forgotPassword(
            @RequestBody org.example.backend.dto.request.auth.ForgotPasswordRequest request) {
        System.out.println("Quên mật khẩu: " + request.email());
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestBody org.example.backend.dto.request.auth.VerifyOtpRequest request) {
        System.out.println("Xác thực OTP: " + request.email());
        authService.verifyOtp(request);
        return ResponseEntity.ok("Mã OTP hợp lệ.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody org.example.backend.dto.request.auth.ResetPasswordRequest request) {
        System.out.println("Đặt lại mật khẩu: " + request.email());
        authService.resetPassword(request);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công.");
    }
}
