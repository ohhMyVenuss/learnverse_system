package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.auth.LoginRequest;
import org.example.backend.dto.request.auth.RegisterRequest;
import org.example.backend.dto.response.auth.LoginResponse;
import org.example.backend.entity.User;
import org.example.backend.entity.UserProfile;
import org.example.backend.enums.Role;
import org.example.backend.exception.EmailExistsException;
import org.example.backend.repository.UserProfileRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserProfileRepository userProfileRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    public LoginResponse login(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.email(), loginRequest.password()));

        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String jwtToken = jwtService.generateToken(user);
        return new LoginResponse(jwtToken);
    }

    public void register(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            // Ném Lỗi nghiệp vụ (sẽ bị GlobalExceptionHandler bắt)
            throw new EmailExistsException("Email " + registerRequest.email() + " đã tồn tại");
        }
        User newUser = new User();
        newUser.setEmail(registerRequest.email());
        newUser.setPassword(passwordEncoder.encode(registerRequest.password()));
        newUser.setFullName(registerRequest.fullName());
        newUser.setRole(Role.STUDENT);
        userRepository.save(newUser);

        // Tạo UserProfile với avatar random
        UserProfile profile = new UserProfile();
        profile.setUser(newUser);
        profile.setBio("Thành viên mới");
        profile.setAvatarUrl(   generateRandomAvatar(registerRequest.fullName()));
        userProfileRepository.save(profile);
    }

    private String generateRandomAvatar(String fullName) {
        // Kiểm tra null và empty
        String safeName = (fullName != null && !fullName.trim().isEmpty()) ? fullName.trim() : "User";

        // Tách họ và tên, lấy chữ cái đầu của tên cuối (tên)
        String[] nameParts = safeName.split("\\s+");
        String firstLetter;
        if (nameParts.length > 1) {
            // Lấy chữ cái đầu của từ cuối cùng (tên)
            firstLetter = nameParts[nameParts.length - 1].substring(0, 1).toUpperCase();
        } else {
            // Nếu chỉ có 1 từ thì lấy chữ cái đầu
            firstLetter = safeName.substring(0, 1).toUpperCase();
        }

        // Tạo URL avatar với UI Avatars API
        // Sử dụng màu ngẫu nhiên dựa trên hashCode của tên
        String[] colors = { "FF6B6B", "4ECDC4", "45B7D1", "96CEB4", "FFEAA7", "DDA0DD", "98D8C8", "F7DC6F" };
        int colorIndex = Math.abs(safeName.hashCode()) % colors.length;
        String backgroundColor = colors[colorIndex];

        try {
            String encodedName = java.net.URLEncoder.encode(firstLetter, "UTF-8");
            return String.format("https://ui-avatars.com/api/?name=%s&background=%s&color=fff&size=200&font-size=0.6",
                    encodedName, backgroundColor);
        } catch (java.io.UnsupportedEncodingException e) {
            // Fallback nếu có lỗi encoding
            return String.format("https://ui-avatars.com/api/?name=%s&background=%s&color=fff&size=200&font-size=0.6",
                    firstLetter, backgroundColor);
        }
    }

    // --- Forgot Password OTP Storage & Logic ---
    private static class OtpData {
        private final String otp;
        private final long expiryTime;

        public OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() { return otp; }
        public boolean isExpired() { return System.currentTimeMillis() > expiryTime; }
    }

    private final java.util.Map<String, OtpData> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    public org.example.backend.dto.response.auth.ForgotPasswordResponse forgotPassword(
            org.example.backend.dto.request.auth.ForgotPasswordRequest request) {
        String email = request.email();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        // Sinh mã OTP 6 số
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        // Lưu OTP hết hạn trong 5 phút
        otpStorage.put(email, new OtpData(otp, System.currentTimeMillis() + 5 * 60 * 1000));

        System.out.println("[Forgot Password] OTP for " + email + " is: " + otp);

        // Gửi email thực tế
        sendOtpEmail(email, otp);

        return new org.example.backend.dto.response.auth.ForgotPasswordResponse(
                email, "", "Mã xác thực đã được gửi đến email của bạn.");
    }

    private void sendOtpEmail(String toEmail, String otp) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom("clonevclone05@gmail.com");
            message.setTo(toEmail);
            message.setSubject("LearnVerse - Mã xác thực đặt lại mật khẩu");
            message.setText("Chào bạn,\n\nMã xác thực (OTP) để đặt lại mật khẩu của bạn là: " + otp + 
                            "\n\nMã này có hiệu lực trong 5 phút. Vui lòng không cung cấp mã này cho người khác.\n\nTrân trọng,\nLearnVerse Team");
            mailSender.send(message);
            System.out.println("[Forgot Password] Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[Forgot Password] Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void verifyOtp(org.example.backend.dto.request.auth.VerifyOtpRequest request) {
        String email = request.email();
        String otp = request.otp();

        OtpData cachedOtp = otpStorage.get(email);
        if (cachedOtp == null) {
            throw new RuntimeException("Mã OTP chưa được gửi hoặc đã hết hiệu lực.");
        }

        if (cachedOtp.isExpired()) {
            otpStorage.remove(email);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (!cachedOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }
    }

    public void resetPassword(org.example.backend.dto.request.auth.ResetPasswordRequest request) {
        String email = request.email();
        String otp = request.otp();
        String newPassword = request.newPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        OtpData cachedOtp = otpStorage.get(email);
        if (cachedOtp == null) {
            throw new RuntimeException("Mã OTP chưa được gửi hoặc đã hết hiệu lực.");
        }

        if (cachedOtp.isExpired()) {
            otpStorage.remove(email);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (!cachedOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }

        // OTP hợp lệ -> Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xóa OTP đã sử dụng
        otpStorage.remove(email);
        System.out.println("[Forgot Password] Reset password successful for user: " + email);
    }
}
