package org.example.backend.dto.response.payment;

import org.example.backend.enums.PaymentStatus;

public record PaymentResponse(
        Long paymentId,
        PaymentStatus status,
        String checkoutUrl,
        String qrCode
) {
}
