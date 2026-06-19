package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Course;
import org.example.backend.entity.Enrollment;
import org.example.backend.entity.Notification;
import org.example.backend.entity.User;
import org.example.backend.enums.NotificationType;
import org.example.backend.enums.Role;
import org.example.backend.repository.NotificationRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Tạo thông báo cho tất cả admin khi có course mới được tạo
     */
    @Transactional
    public void notifyCourseCreated(Course course) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setRecipient(admin);
            notification.setTitle("Khóa học mới cần duyệt");
            notification.setMessage(String.format(
                    "Giảng viên %s đã tạo khóa học mới '%s' và đang chờ phê duyệt.",
                    course.getTeacher().getFullName() != null ? course.getTeacher().getFullName()
                            : course.getTeacher().getEmail(),
                    course.getTitle()));
            notification.setType(NotificationType.COURSE_PENDING);
            notification.setCourse(course);
            notificationRepository.save(notification);
        }
    }

    /**
     * Tạo thông báo cho tất cả admin khi course được chỉnh sửa và chuyển từ
     * REJECTED sang PENDING
     */
    @Transactional
    public void notifyCourseUpdated(Course course) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setRecipient(admin);
            notification.setTitle("Khóa học đã được chỉnh sửa");
            notification.setMessage(String.format(
                    "Giảng viên %s đã chỉnh sửa khóa học '%s' sau khi bị từ chối. Khóa học đang chờ phê duyệt lại.",
                    course.getTeacher().getFullName() != null ? course.getTeacher().getFullName()
                            : course.getTeacher().getEmail(),
                    course.getTitle()));
            notification.setType(NotificationType.COURSE_PENDING);
            notification.setCourse(course);
            notificationRepository.save(notification);
        }
    }

    /**
     * Tạo thông báo khi course được approve
     */
    @Transactional
    public Notification notifyCourseApproved(Course course) {
        User teacher = course.getTeacher();
        Notification notification = new Notification();
        notification.setRecipient(teacher);
        notification.setTitle("Khóa học đã được duyệt");
        notification.setMessage(
                String.format("Khóa học '%s' của bạn đã được phê duyệt và đã được công khai.", course.getTitle()));
        notification.setType(NotificationType.COURSE_APPROVED);
        notification.setCourse(course);
        return notificationRepository.save(notification);
    }

    /**
     * Tạo thông báo khi course bị reject
     */
    @Transactional
    public Notification notifyCourseRejected(Course course, String rejectionReason) {
        User teacher = course.getTeacher();
        Notification notification = new Notification();
        notification.setRecipient(teacher);
        notification.setTitle("Khóa học đã bị từ chối");
        notification.setMessage(String.format(
                "Khóa học '%s' của bạn đã bị từ chối.\nLý do: %s",
                course.getTitle(),
                rejectionReason != null && !rejectionReason.isEmpty()
                        ? rejectionReason
                        : "Không đạt yêu cầu chất lượng"));
        notification.setType(NotificationType.COURSE_REJECTED);
        notification.setCourse(course);
        return notificationRepository.save(notification);
    }

    /**
     * Lấy tất cả thông báo của user
     */
    public List<Notification> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    /**
     * Lấy thông báo chưa đọc
     */
    public List<Notification> getUnreadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientAndIsReadOrderByCreatedAtDesc(user, false);
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @Transactional
    public Notification markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền đánh dấu thông báo này");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public Long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByRecipientAndIsRead(user, false);
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unreadNotifications = notificationRepository
                .findByRecipientAndIsReadOrderByCreatedAtDesc(user, false);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Tạo thông báo khi course bị xóa cho teacher và enrolled students
     */
    @Transactional
    public void notifyCourseDeleted(Course course, String reason, List<Enrollment> enrollments) {
        // Thông báo cho teacher
        Notification teacherNotification = new Notification();
        teacherNotification.setRecipient(course.getTeacher());
        teacherNotification.setTitle("Khóa học đã bị xóa");
        teacherNotification.setMessage(String.format(
                "Khóa học '%s' của bạn đã bị xóa khỏi hệ thống.\nLý do: %s",
                course.getTitle(),
                reason != null && !reason.isEmpty() ? reason : "Không được cung cấp"));
        teacherNotification.setType(NotificationType.COURSE_REJECTED);
        teacherNotification.setCourse(null); // Course đã bị xóa nên không link
        notificationRepository.save(teacherNotification);

        // Thông báo cho tất cả enrolled students
        for (Enrollment enrollment : enrollments) {
            Notification studentNotification = new Notification();
            studentNotification.setRecipient(enrollment.getUser());
            studentNotification.setTitle("Khóa học đã bị xóa");
            studentNotification.setMessage(String.format(
                    "Khóa học '%s' mà bạn đã đăng ký đã bị xóa khỏi hệ thống.\nLý do: %s",
                    course.getTitle(),
                    reason != null && !reason.isEmpty() ? reason : "Không được cung cấp"));
            studentNotification.setType(NotificationType.INFO);
            studentNotification.setCourse(null);
            notificationRepository.save(studentNotification);
        }
    }

    /**
     * Tạo thông báo khi có người reply comment
     */
    @Transactional
    public void notifyCommentReply(Comment parentComment, Comment replyComment) {
        User recipient = parentComment.getUser();
        User replier = replyComment.getUser();

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle("Có người đã trả lời bình luận của bạn");
        notification.setMessage(String.format(
                "%s đã trả lời bình luận của bạn: \"%s\"",
                replier.getFullName() != null ? replier.getFullName() : replier.getEmail(),
                replyComment.getContent().length() > 50
                        ? replyComment.getContent().substring(0, 50) + "..."
                        : replyComment.getContent()));
        notification.setType(NotificationType.INFO);
        notificationRepository.save(notification);
    }
}
