package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.user.UserProfileRequest;
import org.example.backend.entity.User;
import org.example.backend.entity.UserProfile;
import org.example.backend.repository.UserProfileRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfile getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Create empty profile if doesn't exist
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return userProfileRepository.save(newProfile);
                });
    }

    public UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElse(null); // Trả về null nếu chưa có profile
    }

    public UserProfile updateProfile(String email, UserProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Create profile if doesn't exist
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });
        if (request.bio() != null)
            profile.setBio(request.bio());
        if (request.phone() != null)
            profile.setPhone(request.phone());
        if (request.address() != null)
            profile.setAddress(request.address());
        if (request.avatarUrl() != null)
            profile.setAvatarUrl(request.avatarUrl());
        if (request.birthday() != null)
            profile.setBirthday(request.birthday());
        if (request.socialLinks() != null)
            profile.setSocialLinks(request.socialLinks());
        return userProfileRepository.save(profile);
    }

}
