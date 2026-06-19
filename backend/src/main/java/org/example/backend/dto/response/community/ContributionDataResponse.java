package org.example.backend.dto.response.community;

import java.time.LocalDate;

public record ContributionDataResponse(
        LocalDate date,
        Long count
) {
}
