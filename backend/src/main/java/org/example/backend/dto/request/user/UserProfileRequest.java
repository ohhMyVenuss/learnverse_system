package org.example.backend.dto.request.user;

import java.time.LocalDate;

public record UserProfileRequest(
        String bio,
        String avatarUrl,
        String phone,
        String address,
        LocalDate birthday,
        String socialLinks
) {
}
