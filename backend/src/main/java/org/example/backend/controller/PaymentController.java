package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.payment.PaymentRequest;
import org.example.backend.dto.response.payment.PaymentResponse;
import org.example.backend.dto.response.payment.PaymentStatusResponse;
import org.example.backend.entity.Payment;
import org.example.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(paymentService.createPaymentLink(principal.getName(), request));
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo thanh toán PayOS: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getMyPaymentHistory(Principal principal) {
        return ResponseEntity.ok(paymentService.getUserPayments(principal.getName()));
    }

    @GetMapping("/{paymentId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
            @PathVariable Long paymentId,
            Principal principal) {
        Payment payment = paymentService.getPaymentStatus(paymentId, principal.getName());
        return ResponseEntity.ok(new PaymentStatusResponse(payment.getId(), payment.getStatus()));
    }

    @GetMapping("/cart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getMyCart(Principal principal) {
        return ResponseEntity.ok(paymentService.getUserCartPayments(principal.getName()));
    }

    @PostMapping("/{paymentId}/success")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approvePayment(@PathVariable Long paymentId) {
        paymentService.processPaymentSuccess(paymentId);
        return ResponseEntity.ok("Duyệt thanh toán thành công! Học viên đã được vào học.");
    }

    @PostMapping("/{paymentId}/failed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> rejectPayment(@PathVariable Long paymentId) {
        paymentService.processPaymentFailed(paymentId);
        return ResponseEntity.ok("Đã từ chối thanh toán này.");
    }

    @PostMapping("/{paymentId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> cancelPayment(@PathVariable Long paymentId, Principal principal) {
        paymentService.cancelPayment(paymentId, principal.getName());
        return ResponseEntity.ok("Đã hủy đơn hàng thành công.");
    }

    // này để cho kì sang, hiện tại chưa dùng đến
    // // 5. Admin xem lịch sử của TẤT CẢ mọi người (Quản lý doanh thu)
    // @GetMapping("/all")
    // @PreAuthorize("hasRole('ADMIN')") // Chỉ Admin được vào
    // public ResponseEntity<List<Payment>> getAllPayments() {
    // // Gọi service lấy findAll()
    // return ResponseEntity.ok(paymentService.getAllPayments());
    // }
}
