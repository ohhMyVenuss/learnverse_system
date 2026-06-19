package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.PayOS;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
public class WebhookController {
    private final PayOS payOS;
    private final PaymentService paymentService;

    @PostMapping("/payos")
    public ResponseEntity<Map<String, String>> handlePayOSWebhook(@RequestBody Webhook webhook) {
        try {
            // Never trust the payload before its checksum has been verified.
            WebhookData data = payOS.verifyPaymentWebhookData(webhook);
            if (data == null || data.getOrderCode() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing webhook data"));
            }

            // PayOS transaction code "00" means that the transfer was successful.
            if ("00".equals(data.getCode())) {
                paymentService.processPaymentSuccess(data.getOrderCode());
            }

            return ResponseEntity.ok(Map.of("message", "Webhook processed"));
        } catch (Exception exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid webhook signature or data"));
        }
    }
}
