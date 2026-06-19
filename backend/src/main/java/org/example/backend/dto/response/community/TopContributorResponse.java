package org.example.backend.dto.response.community;

import org.example.backend.enums.Role;

public record TopContributorResponse(
        Long userId,
        String userFullName,
        String userAvatarUrl,
        Role userRole,
        Long contributions
) {
}
