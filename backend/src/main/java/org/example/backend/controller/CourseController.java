package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.course.ApproveCourseRequest;
import org.example.backend.dto.request.course.BatchLessonRequest;
import org.example.backend.dto.request.course.CourseRequest;
import org.example.backend.dto.request.course.LessonRequest;
import org.example.backend.entity.Course;
import org.example.backend.entity.Lesson;
import org.example.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;

    // Lấy danh sách khóa học ĐÃ DUYỆT (công khai)
    @GetMapping
    public ResponseEntity<List<Course>> getApprovedCourses() {
        System.out.println("Dang lay toan bo danh sach cac course");
        return ResponseEntity.ok(courseService.getApprovedCourses());
    }

    // Teacher xem khóa học của mình (kể cả PENDING, REJECTED)
    @GetMapping("/my-courses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Course>> getMyCourses(Principal principal) {
        return ResponseEntity.ok(courseService.getMyCourses(principal.getName()));
    }

    // 3. Admin xem danh sách khóa học CHỜ DUYỆT
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getPendingCourses(Principal principal) {
        return ResponseEntity.ok(courseService.getPendingCourses());
    }

    // Teacher tạo khóa học (mặc định PENDING)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Course> createCourse(@RequestBody CourseRequest request, Principal principal) {
        return ResponseEntity.ok(courseService.createCourse(request, principal.getName()));
    }

    // Lấy chi tiết khóa học (dùng cho instructor/admin)
    @GetMapping("/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Course> getCourseById(@PathVariable Long courseId, Principal principal) {
        // Ủy quyền kiểm tra quyền trong service nếu cần
        // Hiện tại chỉ cần tìm theo id (Teacher chỉ xem được của mình trong UI)
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    // Cập nhật thông tin cơ bản của khóa học
    @PutMapping("/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Course> updateCourse(@PathVariable Long courseId,
                                               @RequestBody CourseRequest request,
                                               Principal principal) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request, principal.getName()));
    }

    // Admin duyệt khóa học
    @PutMapping("/{courseId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> approveCourse(@PathVariable Long courseId, Principal principal) {
        return ResponseEntity.ok(courseService.approveCourse(courseId, principal.getName()));
    }

    // Admin từ chối khóa học
    @PutMapping("/{courseId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> rejectCourse(
            @PathVariable Long courseId,
            @RequestBody(required = false) ApproveCourseRequest request,
            Principal principal) {
        System.out.println("Dang su dung chuc nang tu choi khoa hoc");
        // request có thể null nếu không có lý do từ chối
        ApproveCourseRequest rejectRequest = request != null
                ? request
                : new ApproveCourseRequest("Không đạt yêu cầu chất lượng");
        return ResponseEntity.ok(courseService.rejectCourse(courseId, rejectRequest, principal.getName()));
    }

    // Teacher thêm bài học vào khóa học
    @PostMapping("/{courseId}/lessons")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Lesson> addLesson(@PathVariable Long courseId, @RequestBody LessonRequest request, Principal principal) {
        return ResponseEntity.ok(courseService.addLessonToCourse(courseId, request, principal.getName()));
    }

    // Teacher thêm nhiều bài học cùng lúc (batch) - Tối ưu hiệu suất
    @PostMapping("/{courseId}/lessons/batch")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Lesson>> addLessonsBatch(@PathVariable Long courseId, @RequestBody BatchLessonRequest request, Principal principal) {
        return ResponseEntity.ok(courseService.addLessonsToCourseBatch(courseId, request.lessons(), principal.getName()));
    }

    // Xem nội dung khóa học
    @GetMapping("/{courseId}/content")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getCourseContent(@PathVariable Long courseId, Principal principal) {
        return ResponseEntity.ok(courseService.getCourseContent(courseId, principal.getName()));
    }
    // ========================================= LESSON ==========================================
    // Teacher cập nhật bài học
    @PutMapping("/{courseId}/lessons/{lessonId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long courseId, @PathVariable Long lessonId, @RequestBody LessonRequest request, Principal principal) {
        return ResponseEntity.ok(courseService.updateLesson(courseId, lessonId, request, principal.getName()));
    }

    // Teacher xóa bài học
    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteLesson(@PathVariable Long courseId, @PathVariable Long lessonId, Principal principal) {
        courseService.deleteLesson(courseId, lessonId, principal.getName());
        return ResponseEntity.ok("Lesson deleted successfully");
    }

    // Danh sách bài học thuộc một khóa học (dùng cho màn chi tiết course)
    @GetMapping("/{courseId}/lessons")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Lesson>> getLessonsByCourse(@PathVariable Long courseId, Principal principal) {
        // Có thể bổ sung kiểm tra quyền sau nếu cần (ví dụ chỉ xem được khi course APPROVED)
        return ResponseEntity.ok(courseService.getLessonsByCourseId(courseId));
    }


    // Đăng ký khóa học (chỉ cho phép nếu APPROVED)
    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> enrollFreeCourse(@PathVariable Long courseId, Principal principal) {
        courseService.enrollUserInCourse(courseId, principal.getName());
        return ResponseEntity.ok("Đăng ký khóa học thành công!");
    }

    // Lấy danh sách khóa học đã đăng ký của user
    @GetMapping("/enrolled")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Course>> getEnrolledCourses(Principal principal) {
        return ResponseEntity.ok(courseService.getEnrolledCourses(principal.getName()));
    }

    // Kiểm tra xem user đã đăng ký khóa học chưa
    @GetMapping("/{courseId}/enrollment-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> checkEnrollmentStatus(@PathVariable Long courseId, Principal principal) {
        return ResponseEntity.ok(courseService.isUserEnrolled(courseId, principal.getName()));
    }

    // Lấy số lượng học sinh đã đăng ký khóa học
    @GetMapping("/{courseId}/enrollment-count")
    public ResponseEntity<Long> getEnrollmentCount(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getEnrollmentCount(courseId));
    }

    // Admin xóa khóa học
    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteCourse(@PathVariable Long courseId, @RequestBody(required = false) ApproveCourseRequest request, Principal principal) {
        ApproveCourseRequest deleteRequest = request != null
                ? request
                : new ApproveCourseRequest("Khóa học đã bị xóa khỏi hệ thống");
        courseService.deleteCourse(courseId, deleteRequest, principal.getName());
        return ResponseEntity.ok("Course deleted successfully");
    }
}