package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.example.backend.dto.request.payment.PaymentRequest;
import org.example.backend.dto.response.payment.PaymentResponse;
import org.example.backend.entity.Course;
import org.example.backend.entity.Enrollment;
import org.example.backend.entity.Payment;
import org.example.backend.entity.User;
import org.example.backend.enums.PaymentStatus;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.EnrollmentRepository;
import org.example.backend.repository.PaymentRepository;
import org.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.PaymentLinkData;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PayOS payOS;

    @Value("${payos.return-url}")
    private String returnUrl;
    @Value("${payos.cancel-url}")
    private String cancelUrl;

    public PaymentResponse createPaymentLink(String userEmail, PaymentRequest request) throws Exception {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("Bạn đã sở hữu khóa học này rồi!");
        }
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("Bạn đã sở hữu khóa học này rồi! Vào học ngay.");
        }
        // Tự động hủy đơn hàng pending cũ nếu có
        List<Payment> pendingPayments = paymentRepository.findByUserIdAndCourseIdAndStatus(
                user.getId(), course.getId(), PaymentStatus.PENDING);
        if (!pendingPayments.isEmpty()) {
            for (Payment p : pendingPayments) {
                p.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(p);
            }
        }

        long orderCode = System.currentTimeMillis();
        while (paymentRepository.findByOrderCode(orderCode) != null) {
            orderCode++;
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setCourse(course);
        payment.setAmount(course.getPrice());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrderCode(orderCode);
        Payment savedPayment = paymentRepository.save(payment);

        long expiredAt = (System.currentTimeMillis() / 1000) + (10 * 60); // 10 phút
        String description = "Thanh toan don hang " + savedPayment.getId();
        ItemData item = ItemData.builder()
                .name("Khóa học: " + course.getTitle())
                .quantity(1)
                .price(savedPayment.getAmount().intValue())
                .build();
        PaymentData paymentData = PaymentData.builder()
                .orderCode(orderCode) // Dùng timestamp để đảm bảo unique
                .amount(savedPayment.getAmount().intValue()) // PayOS cần số nguyên (VNĐ)
                .description(description)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .item(item)// Sản phẩm
                .expiredAt(expiredAt)
                .build();
        CheckoutResponseData data = payOS.createPaymentLink(paymentData);
        return new PaymentResponse(
                savedPayment.getId(),
                savedPayment.getStatus(),
                data.getCheckoutUrl(),
                data.getQrCode());
    }

    @Transactional
    public void processPaymentSuccess(Long identifier) {
        System.out.println("DEBUG: Bắt đầu xử lý với Identifier: " + identifier);

        // Thử tìm theo orderCode trước (cho Webhook PayOS)
        Payment payment = paymentRepository.findByOrderCode(identifier);
        
        // Nếu không tìm thấy, thử tìm theo database id (cho API /success của Admin/kiểm thử)
        if (payment == null) {
            payment = paymentRepository.findById(identifier).orElse(null);
        }

        if (payment == null) {
            throw new RuntimeException("Payment not found with identifier: " + identifier);
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            System.out.println("DEBUG: Đơn này đã SUCCESS từ trước rồi. Bỏ qua.");
            return;
        }

        // Update Payment
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);
        System.out.println("DEBUG: Đã update trạng thái Payment thành SUCCESS");

        // Tạo Enrollment
        if (!enrollmentRepository.existsByUserIdAndCourseId(payment.getUser().getId(), payment.getCourse().getId())) {
            Enrollment enrollment = new Enrollment();
            enrollment.setUser(payment.getUser());
            enrollment.setCourse(payment.getCourse());
            enrollmentRepository.save(enrollment);
            System.out.println("DEBUG: Đã tạo Enrollment thành công");
        } else {
            System.out.println("DEBUG: Enrollment đã tồn tại, không tạo mới.");
        }
    }

    /**
     * Return the latest status for a payment owned by the current user. If the
     * webhook has not arrived yet, synchronize the order directly with PayOS.
     */
    @Transactional
    public Payment getPaymentStatus(Long paymentId, String userEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Bạn không có quyền xem giao dịch này");
        }

        if (payment.getStatus() != PaymentStatus.PENDING || payment.getOrderCode() == null) {
            return payment;
        }

        PaymentLinkData paymentLink;
        try {
            paymentLink = payOS.getPaymentLinkInformation(payment.getOrderCode());
        } catch (Exception exception) {
            log.warn("Could not synchronize PayOS order {}: {}",
                    payment.getOrderCode(), exception.getMessage());
            return payment;
        }

        String payOSStatus = paymentLink.getStatus();
        if ("PAID".equalsIgnoreCase(payOSStatus)) {
            processPaymentSuccess(payment.getOrderCode());
            return paymentRepository.findById(paymentId).orElseThrow();
        }

        if ("CANCELLED".equalsIgnoreCase(payOSStatus)
                || "CANCELED".equalsIgnoreCase(payOSStatus)
                || "EXPIRED".equalsIgnoreCase(payOSStatus)) {
            payment.setStatus(PaymentStatus.FAILED);
            return paymentRepository.save(payment);
        }

        return payment;
    }

    public void processPaymentFailed(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        if (payment.getStatus() == PaymentStatus.SUCCESS)
            return;

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }

    @Transactional
    public void cancelPayment(Long paymentId, String userEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Kiểm tra payment có thuộc về user này không
        if (!payment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        // Chỉ cho phép hủy đơn hàng PENDING
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ thanh toán");
        }

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }

    public List<Payment> getUserPayments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByUserId(user.getId());
    }

    public List<Payment> getUserCartPayments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<PaymentStatus> statuses = List.of(PaymentStatus.PENDING, PaymentStatus.SUCCESS);
        return paymentRepository.findByUserIdAndStatusIn(user.getId(), statuses);
    }

}
