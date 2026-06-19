package org.example.backend.dto.response.payment;

import org.example.backend.enums.PaymentStatus;

public record PaymentStatusResponse(
        Long paymentId,
        PaymentStatus status
) {
}
