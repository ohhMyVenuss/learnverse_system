package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.dashboard.AdminDashboardResponse;
import org.example.backend.dto.response.dashboard.statistics.EnrollmentStats;
import org.example.backend.dto.response.dashboard.statistics.TopTeacherInfo;
import org.example.backend.dto.response.dashboard.statistics.*;
import org.example.backend.entity.Course;
import org.example.backend.entity.Enrollment;
import org.example.backend.entity.Payment;
import org.example.backend.entity.User;
import org.example.backend.enums.CourseStatus;
import org.example.backend.enums.PaymentStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public AdminDashboardResponse getDashboardStats() {
        return new AdminDashboardResponse(
                calculateOverviewStats(),
                calculateCourseStats(),
                calculatePaymentStats(),
                calculateUserStats(),
                calculateEnrollmentStats(),
                calculateBlogStats()
        );
    }

    // co cac doanh thu thanh cong tu paymehnjt
    private OverviewStats calculateOverviewStats() {
        System.out.println("Dang tinh toan ben overviewstats");
        Long totalUsers = userRepository.count();
        Long totalCourses = courseRepository.count();
        Long totalEnrollments = enrollmentRepository.count();

        // Tính tổng doanh thu từ payments thành công
        List<Payment> successfulPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .collect(Collectors.toList());
        Double totalRevenue = successfulPayments.stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        return new OverviewStats(
                totalUsers,
                totalCourses,
                totalEnrollments,
                totalRevenue
        );
    }

    private CourseStats calculateCourseStats() {
        List<Course> allCourses = courseRepository.findAll();

        Long totalCourses = (long) allCourses.size();
        /*
        Long pendingCourses = 0
        for (Course c: allCourses) if (c.getStatus() == CourseStatus.PENDING) pendingCourses++;
        */
        Long pendingCourses = allCourses.stream()
                .filter(c -> c.getStatus() == CourseStatus.PENDING)
                .count();
        Long approvedCourses = allCourses.stream()
                .filter(c -> c.getStatus() == CourseStatus.APPROVED)
                .count();
        Long rejectedCourses = allCourses.stream()
                .filter(c -> c.getStatus() == CourseStatus.REJECTED)
                .count();

        // Khóa học mới trong tuần và tháng
        LocalDateTime oneWeekAgo = LocalDateTime.now().minus(1, ChronoUnit.WEEKS); // tu tuan truoc den gio
        LocalDateTime oneMonthAgo = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);

        Long newCoursesThisWeek = allCourses.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(oneWeekAgo))
                .count();

        Long newCoursesThisMonth = allCourses.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        // Phân bổ theo category
        Map<String, Long> coursesByCategory = allCourses.stream()
                .filter(c -> c.getCategory() != null && !c.getCategory().isEmpty())
                .collect(Collectors.groupingBy(
                        Course::getCategory,
                        Collectors.counting()
                ));

        // Phân bổ theo level
        Map<String, Long> coursesByLevel = allCourses.stream()
                .filter(c -> c.getLevel() != null && !c.getLevel().isEmpty())
                .collect(Collectors.groupingBy(
                        Course::getLevel,
                        Collectors.counting()
                ));

        // Top courses theo enrollments
        List<TopCourseInfo> topCoursesByEnrollments = new ArrayList<>();
        List<Course> approvedCoursesList = allCourses.stream()
                .filter(c -> c.getStatus() == CourseStatus.APPROVED)
                .collect(Collectors.toList());

        for (Course course : approvedCoursesList) {
            Long enrollmentCount = enrollmentRepository.countByCourse(course);
            if (enrollmentCount == null) enrollmentCount = 0L;

            // Tính revenue từ payments thành công cho course này
            List<Payment> coursePayments = paymentRepository.findByCourseId(course.getId());
            Double revenue = coursePayments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                    .sum();

            topCoursesByEnrollments.add(new TopCourseInfo(
                    course.getId(),
                    course.getTitle(),
                    enrollmentCount,
                    revenue
            ));
        }

        // Sắp xếp theo enrollment count giảm dần và lấy top 10
        topCoursesByEnrollments = topCoursesByEnrollments.stream()
                .sorted((a, b) -> Long.compare(b.enrollmentCount(), a.enrollmentCount()))
                .limit(10)
                .collect(Collectors.toList());

        return new CourseStats(
                totalCourses,
                pendingCourses,
                approvedCourses,
                rejectedCourses,
                newCoursesThisWeek,
                newCoursesThisMonth,
                coursesByCategory,
                coursesByLevel,
                topCoursesByEnrollments
        );
    }

    private PaymentStats calculatePaymentStats() {
        List<Payment> allPayments = paymentRepository.findAll();

        Long totalTransactions = (long) allPayments.size();
        Long successfulTransactions = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .count();
        Long pendingTransactions = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .count();
        Long failedTransactions = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .count();

        // Tính tổng doanh thu
        Double totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        // Doanh thu tuần này và tháng này
        LocalDateTime oneWeekAgo = LocalDateTime.now().minus(1, ChronoUnit.WEEKS);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);

        Double revenueThisWeek = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .filter(p -> p.getPaidAt() != null && p.getPaidAt().isAfter(oneWeekAgo))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        Double revenueThisMonth = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .filter(p -> p.getPaidAt() != null && p.getPaidAt().isAfter(oneMonthAgo))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        // Tỷ lệ thành công
        Double successRate = totalTransactions > 0
                ? (successfulTransactions.doubleValue() / totalTransactions.doubleValue()) * 100.0
                : 0.0;

        return new PaymentStats(
                totalTransactions,
                successfulTransactions,
                pendingTransactions,
                failedTransactions,
                totalRevenue,
                revenueThisWeek,
                revenueThisMonth,
                successRate
        );
    }

    private UserStats calculateUserStats() {
        List<User> allUsers = userRepository.findAll();

        Long totalUsers = (long) allUsers.size();
        Long totalStudents = allUsers.stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .count();
        Long totalTeachers = allUsers.stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .count();
        Long totalAdmins = allUsers.stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .count();

        // Người dùng mới trong tuần và tháng
        LocalDateTime oneWeekAgo = LocalDateTime.now().minus(1, ChronoUnit.WEEKS);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);

        Long newUsersThisWeek = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(oneWeekAgo))
                .count();

        Long newUsersThisMonth = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        // Top teachers (có nhiều courses được duyệt nhất)
        List<TopTeacherInfo> topTeachers = new ArrayList<>();
        List<User> teachers = allUsers.stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .collect(Collectors.toList());

        for (User teacher : teachers) {
            List<Course> teacherCourses = courseRepository.findByTeacherId(teacher.getId());
            Long approvedCoursesCount = teacherCourses.stream()
                    .filter(c -> c.getStatus() == CourseStatus.APPROVED)
                    .count();

            topTeachers.add(new TopTeacherInfo(
                    teacher.getId(),
                    teacher.getFullName() != null ? teacher.getFullName() : teacher.getEmail(),
                    teacher.getEmail(),
                    approvedCoursesCount
            ));
        }

        // Sắp xếp theo số courses được duyệt giảm dần và lấy top 10
        topTeachers = topTeachers.stream()
                .sorted((a, b) -> Long.compare(b.approvedCoursesCount(), a.approvedCoursesCount()))
                .limit(10)
                .collect(Collectors.toList());

        return new UserStats(
                totalUsers,
                totalStudents,
                totalTeachers,
                totalAdmins,
                newUsersThisWeek,
                newUsersThisMonth,
                topTeachers
        );
    }

    private EnrollmentStats calculateEnrollmentStats() {
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();

        Long totalEnrollments = (long) allEnrollments.size();

        // Đăng ký mới trong tuần và tháng
        LocalDateTime oneWeekAgo = LocalDateTime.now().minus(1, ChronoUnit.WEEKS);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);

        Long newEnrollmentsThisWeek = allEnrollments.stream()
                .filter(e -> e.getEnrollmentAt() != null && e.getEnrollmentAt().isAfter(oneWeekAgo))
                .count();

        Long newEnrollmentsThisMonth = allEnrollments.stream()
                .filter(e -> e.getEnrollmentAt() != null && e.getEnrollmentAt().isAfter(oneMonthAgo))
                .count();

        // Tính trung bình progress
        Double averageProgress = allEnrollments.stream()
                .filter(e -> e.getProgress() != null)
                .mapToDouble(Enrollment::getProgress)
                .average()
                .orElse(0.0);

        // Top courses theo enrollments (tái sử dụng logic từ CourseStats)
        List<Course> approvedCourses = courseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CourseStatus.APPROVED)
                .collect(Collectors.toList());

        List<TopCourseInfo> topCoursesByEnrollments = new ArrayList<>();
        for (Course course : approvedCourses) {
            Long enrollmentCount = enrollmentRepository.countByCourse(course);
            if (enrollmentCount == null) enrollmentCount = 0L;

            List<Payment> coursePayments = paymentRepository.findByCourseId(course.getId());
            Double revenue = coursePayments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                    .sum();

            topCoursesByEnrollments.add(new TopCourseInfo(
                    course.getId(),
                    course.getTitle(),
                    enrollmentCount,
                    revenue
            ));
        }

        topCoursesByEnrollments = topCoursesByEnrollments.stream()
                .sorted((a, b) -> Long.compare(b.enrollmentCount(), a.enrollmentCount()))
                .limit(10)
                .collect(Collectors.toList());

        return new EnrollmentStats(
                totalEnrollments,
                newEnrollmentsThisWeek,
                newEnrollmentsThisMonth,
                averageProgress,
                topCoursesByEnrollments
        );
    }

    private BlogStats calculateBlogStats() {
        List<org.example.backend.entity.Post> allPosts = postRepository.findAll();
        List<org.example.backend.entity.Comment> allComments = commentRepository.findAll();

        Long totalPosts = (long) allPosts.size();
        Long totalComments = (long) allComments.size();

        // Posts và comments trong tuần và tháng
        LocalDateTime oneWeekAgo = LocalDateTime.now().minus(1, ChronoUnit.WEEKS);
        LocalDateTime oneMonthAgo = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);

        Long postsThisWeek = allPosts.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(oneWeekAgo))
                .count();

        Long commentsThisWeek = allComments.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(oneWeekAgo))
                .count();

        Long postsThisMonth = allPosts.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        Long commentsThisMonth = allComments.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        return new BlogStats(
                totalPosts,
                totalComments,
                postsThisWeek,
                commentsThisWeek,
                postsThisMonth,
                commentsThisMonth
        );
    }
}

