package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.user.UserProfileRequest;
import org.example.backend.dto.response.community.ContributionDataResponse;
import org.example.backend.dto.response.dashboard.UserStatisticsResponse;
import org.example.backend.entity.UserProfile;
import org.example.backend.service.PostService;
import org.example.backend.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;
    private final PostService postService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfile> getMyProfile(Principal principal) {
        return ResponseEntity.ok(userProfileService.getMyProfile(principal.getName()));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfile> updateProfile(@RequestBody UserProfileRequest request, Principal principal) {
//        System.out.println("Updating profile for user: " + principal.getName());
        return ResponseEntity.ok(userProfileService.updateProfile(principal.getName(), request));
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserStatisticsResponse> getMyStatistics(Principal principal) {
        return ResponseEntity.ok(postService.getUserStatistics(principal.getName()));
    }

    @GetMapping("/contributions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ContributionDataResponse>> getMyContributions(Principal principal) {
        return ResponseEntity.ok(postService.getUserContributionData(principal.getName()));
    }

    // Lấy profile của user khác (public endpoint, chỉ lấy bio và avatar)
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserProfile> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userProfileService.getUserProfile(userId));
    }
}
