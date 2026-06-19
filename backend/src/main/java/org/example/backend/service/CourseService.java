package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.course.ApproveCourseRequest;
import org.example.backend.dto.request.course.CourseRequest;
import org.example.backend.dto.request.course.LessonRequest;
import org.example.backend.entity.Course;
import org.example.backend.entity.Enrollment;
import org.example.backend.entity.Lesson;
import org.example.backend.entity.Post;
import org.example.backend.entity.Payment;
import org.example.backend.entity.User;
import org.example.backend.enums.CourseStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.CourseRepository;
import org.example.backend.repository.EnrollmentRepository;
import org.example.backend.repository.LessonRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.PaymentRepository;
import org.example.backend.entity.Flashcard;
import org.example.backend.entity.Quiz;
import org.example.backend.repository.QuizRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final PostRepository postRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final QuizRepository quizRepository;

    // lấy danh sách tất cả các khóa học kể cả pending, reject, approved (chỉ dùng cho admin để duệt)
    public List<Course> getAllCourses(){return courseRepository.findAll();}

    // Lấy danh sách các khóa học đã được duyệt (accpect), hiển thị công khai cho cả học viên và giáo viên
    public List<Course> getApprovedCourses() {
        return courseRepository.findByStatusOrderByCreatedAtDesc(CourseStatus.APPROVED);
    }

    // Lấy danh sách các khóa học đang được chờ duyệt : status = PENDING
    public List<Course> getPendingCourses() {
        return courseRepository.findByStatusOrderByCreatedAtDesc(CourseStatus.PENDING);
    }

    public Course getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public List<Course> getMyCourses(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return courseRepository.findByTeacherId(teacher.getId());
    }


    public Course createCourse(CourseRequest request, String teacherEmail){
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("Bạn không có quyền tạo khóa học (Yêu cầu quyền TEACHER)");
        }
        Course course = new Course();
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setPrice(request.price());
        course.setThumbnail(request.thumbnail());
        course.setCategory(request.category());
        course.setLevel(request.level());
        course.setOverview(request.overview());
        course.setIncludes(request.includes());
        course.setTeacher(teacher);
        course.setStatus(CourseStatus.PENDING);

        Course savedCourse = courseRepository.save(course);

        // Tạo thông báo cho tất cả admin
        notificationService.notifyCourseCreated(savedCourse);

        return savedCourse;
    }

    // admin duyệt khóa học -> staus -> Approved
    public Course approveCourse(Long courseId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).
                orElseThrow(() -> new RuntimeException("User not found!"));
        if(admin.getRole() != Role.ADMIN) throw new RuntimeException("Chỉ admin mới có quyền duyệt khóa học");

        Course course = courseRepository.findById(courseId).
                orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học trong hệ thống"));

        if(course.getStatus() != CourseStatus.PENDING) throw new RuntimeException("Chỉ duyệt các khóa đang trong thái PENDING");

        course.setStatus(CourseStatus.APPROVED);
        course.setRejectionReason(null);

        Course savedCourse = courseRepository.save(course);

        // Tạo thông báo cho instructor
        notificationService.notifyCourseApproved(savedCourse);

        return savedCourse;
    }

    // admin reject
    public Course rejectCourse(Long courseId, ApproveCourseRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).
                orElseThrow(() -> new RuntimeException("User not found"));

        if(admin.getRole() != Role.ADMIN) throw new RuntimeException("Chỉ admin mới có quyền duyệt khóa học");

        Course course = courseRepository.findById(courseId).
                orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học trong hệ thống"));

        if(course.getStatus() != CourseStatus.PENDING)
            throw new RuntimeException("Chỉ duyệt các khóa đang trong trạng thái PENDING");

        course.setStatus(CourseStatus.REJECTED);
        course.setRejectionReason(request.rejectionReason());

        Course savedCourse = courseRepository.save(course);

        // Tạo thông báo cho instructor
        notificationService.notifyCourseRejected(savedCourse, request.rejectionReason());

        return savedCourse;
    }

    // Thêm bài giảng vào bên trong khóa ( có thể thêm lúc trong trạng thái Pending)
    public Lesson addLessonToCourse(Long courseId, LessonRequest request, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("Bạn không phải là chủ sở hữu của khóa học này! Không được phép sửa.");
        }

        // Cho phép thêm lesson nếu: PENDING, REJECTED (để sửa lại), hoặc APPROVED (để bổ sung)
        // Nếu muốn chặt chẽ hơn, có thể chỉ cho phép khi PENDING hoặc REJECTED

        List<Lesson> existingLessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        int nextIndex = existingLessons.size() + 1;
        Lesson lesson = new Lesson();
        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setVideoUrl(request.videoUrl());
        lesson.setOrderIndex(nextIndex);
        lesson.setCourse(course);

        if (request.quizId() != null) {
            Quiz quiz = quizRepository.findById(request.quizId())
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));
            lesson.setQuiz(quiz);
        }

        if (request.flashcards() != null) {
            for (int i = 0; i < request.flashcards().size(); i++) {
                LessonRequest.FlashcardRequest fReq = request.flashcards().get(i);
                Flashcard f = new Flashcard();
                f.setLesson(lesson);
                f.setFrontText(fReq.frontText());
                f.setBackText(fReq.backText());
                f.setOrderIndex(i);
                lesson.getFlashcards().add(f);
            }
        }

        return lessonRepository.save(lesson);
    }

    // Thêm nhiều bài học cùng lúc (batch) - Tối ưu hiệu suất
    public List<Lesson> addLessonsToCourseBatch(Long courseId, List<LessonRequest> lessonRequests, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("Bạn không phải là chủ sở hữu của khóa học này! Không được phép sửa.");
        }

        List<Lesson> existingLessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        int startIndex = existingLessons.size() + 1;

        List<Lesson> lessonsToSave = new java.util.ArrayList<>();
        for (int i = 0; i < lessonRequests.size(); i++) {
            LessonRequest request = lessonRequests.get(i);
            Lesson lesson = new Lesson();
            lesson.setTitle(request.title());
            lesson.setContent(request.content());
            lesson.setVideoUrl(request.videoUrl());
            lesson.setOrderIndex(startIndex + i);
            lesson.setCourse(course);

            if (request.quizId() != null) {
                Quiz quiz = quizRepository.findById(request.quizId())
                        .orElseThrow(() -> new RuntimeException("Quiz not found"));
                lesson.setQuiz(quiz);
            }

            if (request.flashcards() != null) {
                for (int j = 0; j < request.flashcards().size(); j++) {
                    LessonRequest.FlashcardRequest fReq = request.flashcards().get(j);
                    Flashcard f = new Flashcard();
                    f.setLesson(lesson);
                    f.setFrontText(fReq.frontText());
                    f.setBackText(fReq.backText());
                    f.setOrderIndex(j);
                    lesson.getFlashcards().add(f);
                }
            }

            lessonsToSave.add(lesson);
        }

        return lessonRepository.saveAll(lessonsToSave);
    }

    // Cập nhật bài học
    public Lesson updateLesson(Long courseId, Long lessonId, LessonRequest request, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("Bạn không phải là chủ sở hữu của khóa học này! Không được phép sửa.");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Lesson does not belong to this course");
        }

        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setVideoUrl(request.videoUrl());

        if (request.quizId() != null) {
            Quiz quiz = quizRepository.findById(request.quizId())
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));
            lesson.setQuiz(quiz);
        } else {
            lesson.setQuiz(null);
        }

        lesson.getFlashcards().clear();
        if (request.flashcards() != null) {
            for (int i = 0; i < request.flashcards().size(); i++) {
                LessonRequest.FlashcardRequest fReq = request.flashcards().get(i);
                Flashcard f = new Flashcard();
                f.setLesson(lesson);
                f.setFrontText(fReq.frontText());
                f.setBackText(fReq.backText());
                f.setOrderIndex(i);
                lesson.getFlashcards().add(f);
            }
        }

        return lessonRepository.save(lesson);
    }

    // Xóa bài học
    public void deleteLesson(Long courseId, Long lessonId, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("Bạn không phải là chủ sở hữu của khóa học này! Không được phép xóa.");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Lesson does not belong to this course");
        }

        lessonRepository.delete(lesson);
    }

    // Đăng ký khóa học
    public void enrollUserInCourse(Long courseId, String userEmail){
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // chỉ cho phép đăng ký các khóa học được duyêt
        if (course.getStatus() != CourseStatus.APPROVED)
            throw new RuntimeException("This course have not approved yet, Try later!");

        if (enrollmentRepository.findByUserAndCourse(user, course).isPresent()){
            throw new RuntimeException("User already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment(user, course);
        enrollmentRepository.save(enrollment);
    }

    // ======================== Day la tinh nang lien quan den user =============================

    // Lấy danh sách khóa học đã đăng ký của user
    public List<Course> getEnrolledCourses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Enrollment> enrollments = enrollmentRepository.findByUserIdOrderByIdDesc(user.getId());
        return enrollments.stream()
                .map(Enrollment::getCourse)
                .toList();
    }

    // Kiểm tra xem user đã đăng ký khóa học chưa
    public boolean isUserEnrolled(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return enrollmentRepository.findByUserAndCourse(user, course).isPresent();
    }

    // Lấy số lượng học sinh đã đăng ký khóa học
    public Long getEnrollmentCount(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Long count = enrollmentRepository.countByCourse(course);
        return count != null ? count : 0L;
    }

    // chỉ cho phép xem nếu khóa được approved hoaặc là owner , admin hệ thống
    public String getCourseContent(Long courseId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Admin và Teacher (owner) có thể xem bất kỳ trạng thái nào
        if (user.getRole() == Role.ADMIN) {
            return "Chào Admin! Đây là nội dung VIP của khóa học: " + course.getTitle();
        }

        if (user.getRole() == Role.TEACHER && course.getTeacher().getId().equals(user.getId())) {
            return "Chào Giảng viên! Đây là khóa học của bạn: " + course.getTitle();
        }

        // Student chỉ xem được nếu khóa học đã APPROVED
        if (course.getStatus() != CourseStatus.APPROVED) {
            throw new RuntimeException("Khóa học này chưa được duyệt hoặc đã bị từ chối.");
        }

        boolean hasPurchased = enrollmentRepository.findByUserAndCourse(user, course).isPresent();

        if (hasPurchased) {
            return "Chào " + user.getEmail() + "! Đây là nội dung khóa học: " + course.getTitle();
        } else {
            throw new RuntimeException("Access denied. Please enroll in the course to access its content.");
        }
    }

    // Cập nhật thông tin cơ bản của khóa học (chỉ owner hoặc admin, khi đang PENDING/REJECTED)
    public Course updateCourse(Long courseId, CourseRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isOwnerTeacher = user.getRole() == Role.TEACHER &&
                course.getTeacher().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwnerTeacher && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền sửa khóa học này");
        }

//        if (course.getStatus() != CourseStatus.PENDING && course.getStatus() != CourseStatus.REJECTED) {
//            throw new RuntimeException("Chỉ được sửa khi khóa học đang ở trạng thái PENDING hoặc REJECTED");
//        }

        // Lưu trạng thái ban đầu để kiểm tra xem có thay đổi không
        CourseStatus oldStatus = course.getStatus();

        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setPrice(request.price());
        course.setThumbnail(request.thumbnail());
        course.setCategory(request.category());
        course.setLevel(request.level());
        course.setOverview(request.overview());
        course.setIncludes(request.includes());

        // Nếu instructor chỉnh sửa course bị reject, tự động chuyển sang PENDING
        if (isOwnerTeacher && oldStatus == CourseStatus.REJECTED) {
            course.setStatus(CourseStatus.PENDING);
            course.setRejectionReason(null); // Xóa lý do từ chối cũ
        }

        Course savedCourse = courseRepository.save(course);

        // Gửi thông báo cho admin nếu course được chuyển từ REJECTED sang PENDING
        if (isOwnerTeacher && oldStatus == CourseStatus.REJECTED && savedCourse.getStatus() == CourseStatus.PENDING) {
            notificationService.notifyCourseUpdated(savedCourse);
        }

        return savedCourse;
    }

    // Lấy danh sách bài học của một khóa học (sắp xếp theo orderIndex)
    public List<Lesson> getLessonsByCourseId(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId());
    }

    // Admin xóa khóa học
    public void deleteCourse(Long courseId, ApproveCourseRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Chỉ admin mới có quyền xóa khóa học");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học trong hệ thống"));

        // Lấy danh sách học viên đã đăng ký trước khi xóa
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);

        // Xóa tất cả posts trong lessons của course trước (vì posts trong lessons cũng có thể reference đến course)
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        for (Lesson lesson : lessons) {
            List<Post> lessonPosts = postRepository.findByLessonIdOrderByCreatedAtDesc(lesson.getId());
            if (!lessonPosts.isEmpty()) {
                postRepository.deleteAll(lessonPosts);
            }
        }

        // Xóa tất cả posts liên quan trực tiếp đến course
        List<Post> posts = postRepository.findByCourseId(courseId);
        if (!posts.isEmpty()) {
            postRepository.deleteAll(posts);
        }

        // Xóa tất cả payments liên quan đến course
        List<Payment> payments = paymentRepository.findByCourseId(courseId);
        if (!payments.isEmpty()) {
            paymentRepository.deleteAll(payments);
        }

        // Xóa tất cả lessons
        lessonRepository.deleteAll(lessons);

        // Xóa tất cả enrollments
        enrollmentRepository.deleteAll(enrollments);

        // Gửi thông báo cho teacher và enrolled students
        notificationService.notifyCourseDeleted(course, request.rejectionReason(), enrollments);

        // Xóa course
        courseRepository.delete(course);
    }
}
