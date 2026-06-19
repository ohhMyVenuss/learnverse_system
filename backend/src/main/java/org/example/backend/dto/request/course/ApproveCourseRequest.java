package org.example.backend.dto.request.course;

public record ApproveCourseRequest(String rejectionReason) {
    // rejectionReason chỉ cần khi REJECT, có thể null khi APPROVE
}
