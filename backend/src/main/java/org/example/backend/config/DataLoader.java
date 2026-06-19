package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.entity.*;
import org.example.backend.enums.*;
import org.example.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * DataLoader - Tải dữ liệu mẫu đa dạng cho toàn bộ hệ thống Learnverse
 * Bao gồm: Users, Courses, Lessons, Posts, Comments, Quizzes, Payments,
 * Notifications, etc.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final NoteRepository noteRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Bắt đầu tải dữ liệu mẫu...");

        // Kiểm tra nếu đã có dữ liệu thì không load lại
        if (userRepository.count() > 5) {
            log.info("✅ Dữ liệu đã tồn tại, bỏ qua việc tải dữ liệu mẫu");
            return;
        }

        try {
            // 1. Tạo Users (Admin, Teachers, Students)
            List<User> users = createUsers();
            log.info("✅ Đã tạo {} users", users.size());

            // 2. Tạo User Profiles
            createUserProfiles(users);
            log.info("✅ Đã tạo user profiles");

            // 3. Tạo Courses
            List<Course> courses = createCourses(users);
            log.info("✅ Đã tạo {} courses", courses.size());

            // 4. Tạo Lessons cho các Courses
            List<Lesson> lessons = createLessons(courses);
            log.info("✅ Đã tạo {} lessons", lessons.size());

            // 5. Tạo Enrollments
            List<Enrollment> enrollments = createEnrollments(users, courses);
            log.info("✅ Đã tạo {} enrollments", enrollments.size());

            // 6. Tạo Posts (Bài viết blog, câu hỏi)
            List<Post> posts = createPosts(users, courses, lessons);
            log.info("✅ Đã tạo {} posts", posts.size());

            // 7. Tạo Comments và Reactions
            createCommentsAndReactions(users, posts);
            log.info("✅ Đã tạo comments và reactions");

            // 8. Tạo Quizzes
            List<Quiz> quizzes = createQuizzes(users);
            log.info("✅ Đã tạo {} quizzes", quizzes.size());

            // 9. Tạo Quiz Attempts
            createQuizAttempts(users, quizzes);
            log.info("✅ Đã tạo quiz attempts");

            // 10. Tạo Payments
            createPayments(users, courses);
            log.info("✅ Đã tạo payments");

            // 11. Tạo Notifications
            createNotifications(users, courses, posts);
            log.info("✅ Đã tạo notifications");

            // 12. Tạo Notes
            createNotes(users, lessons);
            log.info("✅ Đã tạo notes");

            log.info("🎉 Hoàn tất tải dữ liệu mẫu!");
            printTestAccounts();

        } catch (Exception e) {
            log.error("❌ Lỗi khi tải dữ liệu: {}", e.getMessage(), e);
        }
    }

    private List<User> createUsers() {
        List<User> users = new ArrayList<>();

        // 1 Admin
        User admin = new User();
        admin.setFullName("Admin Hệ Thống");
        admin.setEmail("admin@learnverse.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        users.add(userRepository.save(admin));

        // 1 Teacher
        User teacher = new User();
        teacher.setFullName("TS. Nguyễn Văn An");
        teacher.setEmail("teacher@learnverse.com");
        teacher.setPassword(passwordEncoder.encode("teacher123"));
        teacher.setRole(Role.TEACHER);
        users.add(userRepository.save(teacher));

        // 8 Students
        String[] studentNames = {
                "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D",
                "Hoàng Văn E", "Võ Thị F", "Đặng Văn G", "Bùi Thị H"
        };

        for (int i = 0; i < studentNames.length; i++) {
            User student = new User();
            student.setFullName(studentNames[i]);
            student.setEmail("student" + (i + 1) + "@learnverse.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            users.add(userRepository.save(student));
        }

        return users;
    }

    private void createUserProfiles(List<User> users) {
        String[] bios = {
                "Đam mê lập trình và công nghệ",
                "Yêu thích học tập và chia sẻ kiến thức",
                "Chuyên gia trong lĩnh vực AI và Machine Learning",
                "Thích khám phá các công nghệ mới",
                "Giảng viên nhiệt huyết, tận tâm với học sinh",
                "Researcher trong lĩnh vực Data Science",
                "Full-stack developer với 10 năm kinh nghiệm",
                "DevOps Engineer và Cloud Architect"
        };

        String[] avatarUrls = {
                "https://ui-avatars.com/api/?name=Admin&background=random",
                "https://ui-avatars.com/api/?name=Teacher1&background=random",
                "https://ui-avatars.com/api/?name=Teacher2&background=random",
                "https://ui-avatars.com/api/?name=Student1&background=random"
        };

        for (User user : users) {
            UserProfile profile = new UserProfile();
            profile.setUser(user);
            profile.setBio(bios[random.nextInt(bios.length)]);
            profile.setAvatarUrl(avatarUrls[random.nextInt(avatarUrls.length)]);
            profile.setSocialLinks("GitHub: https://github.com/" + user.getEmail().split("@")[0] +
                    "\nLinkedIn: https://linkedin.com/in/" + user.getEmail().split("@")[0]);
            profile.setPhone("0" + (900000000 + random.nextInt(99999999)));
            profile.setAddress(
                    "Địa chỉ " + (random.nextInt(100) + 1) + ", Quận " + (random.nextInt(12) + 1) + ", TP.HCM");
            userProfileRepository.save(profile);
        }
    }

    private List<Course> createCourses(List<User> users) {
        List<Course> courses = new ArrayList<>();
        User teacher = users.stream().filter(u -> u.getRole() == Role.TEACHER).findFirst().orElse(null);

        // Đa dạng môn học với giá 2000-3000 VND
        String[][] courseData = {
                // {title, description, category, level}
                { "Java Cơ Bản", "Học Java từ đầu với cú pháp và OOP", "Programming", "Easy" },
                { "Python cho Người Mới", "Làm quen với Python và các thư viện cơ bản", "Programming", "Easy" },
                { "JavaScript Nâng Cao", "ES6+, Async/Await, và Modern JS", "Web Development", "Medium" },
                { "HTML & CSS Foundation", "Xây dựng trang web đẹp với HTML5 và CSS3", "Web Development", "Easy" },
                { "React Basics", "Component, State, Props trong React", "Web Development", "Medium" },
                { "SQL Fundamentals", "Truy vấn cơ sở dữ liệu với SQL", "Database", "Easy" },
                { "Git & GitHub", "Version control và làm việc nhóm", "DevOps", "Easy" },
                { "Data Structures", "Cấu trúc dữ liệu cơ bản", "Computer Science", "Medium" },
                { "Algorithms 101", "Thuật toán tìm kiếm và sắp xếp", "Computer Science", "Medium" },
                { "Machine Learning Intro", "Giới thiệu về ML và Python", "Data Science", "Hard" },
                { "Docker Basics", "Container hóa ứng dụng với Docker", "DevOps", "Medium" },
                { "Node.js Express", "Backend API với Node.js", "Backend", "Medium" },
                { "MongoDB NoSQL", "Cơ sở dữ liệu NoSQL với MongoDB", "Database", "Medium" },
                { "Linux Commands", "Dòng lệnh Linux cơ bản", "System Admin", "Easy" },
                { "REST API Design", "Thiết kế RESTful API chuẩn", "Backend", "Hard" }
        };

        // Không cần array này nữa vì đã set level trực tiếp trong courseData

        for (int i = 0; i < courseData.length; i++) {
            Course course = new Course();
            course.setTitle(courseData[i][0]);
            course.setDescription(courseData[i][1]);
            course.setCategory(courseData[i][2]);
            course.setLevel(courseData[i][3]);

            // Giá từ 2000-3000 VND
            course.setPrice(2000.0 + (random.nextInt(1001))); // 2000-3000

            course.setTeacher(teacher);
            course.setThumbnail("https://picsum.photos/seed/course" + i + "/800/450");
            course.setOverview("# Tổng quan khóa học\n\n" + courseData[i][1] +
                    "\n\n## Yêu cầu\n- Kiến thức cơ bản\n- Máy tính\n- Đam mê học");
            course.setIncludes("- Video HD\n- Tài liệu PDF\n- Code mẫu\n- Chứng chỉ");
            course.setStatus(CourseStatus.APPROVED);

            courses.add(courseRepository.save(course));
        }

        return courses;
    }

    private List<Lesson> createLessons(List<Course> courses) {
        List<Lesson> lessons = new ArrayList<>();

        String[][] lessonTemplates = {
                { "Giới thiệu và Cài đặt", "Giới thiệu khóa học và cài đặt công cụ" },
                { "Khái niệm Cơ bản", "Các khái niệm nền tảng cần biết" },
                { "Cú pháp và Cấu trúc", "Chi tiết về cú pháp và cấu trúc" },
                { "Thực hành Đầu tiên", "Bài thực hành đầu tiên" },
                { "Làm việc với Dữ liệu", "Xử lý và quản lý dữ liệu" },
                { "Best Practices", "Các thực hành tốt nhất" },
                { "Dự án Thực tế", "Xây dựng dự án hoàn chỉnh" }
        };

        for (Course course : courses) {
            // Mỗi course có ít nhất 5 lessons, tối đa 7
            int numLessons = 5 + random.nextInt(3); // 5-7 lessons
            for (int i = 0; i < numLessons; i++) {
                Lesson lesson = new Lesson();
                lesson.setCourse(course);
                lesson.setTitle(lessonTemplates[i % lessonTemplates.length][0]);
                lesson.setContent(lessonTemplates[i % lessonTemplates.length][1]);
                lesson.setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                lesson.setOrderIndex(i + 1);
                lessons.add(lessonRepository.save(lesson));
            }
        }

        return lessons;
    }

    private List<Enrollment> createEnrollments(List<User> users, List<Course> courses) {
        List<Enrollment> enrollments = new ArrayList<>();
        List<User> students = users.stream().filter(u -> u.getRole() == Role.STUDENT).toList();
        List<Course> approvedCourses = courses.stream()
                .filter(c -> c.getStatus() == CourseStatus.APPROVED)
                .toList();

        // Mỗi student enroll vào 2-5 courses ngẫu nhiên
        for (User student : students) {
            int numEnrollments = 2 + random.nextInt(4);
            List<Course> selectedCourses = new ArrayList<>(approvedCourses);

            for (int i = 0; i < Math.min(numEnrollments, selectedCourses.size()); i++) {
                Course course = selectedCourses.remove(random.nextInt(selectedCourses.size()));
                Enrollment enrollment = new Enrollment();
                enrollment.setUser(student);
                enrollment.setCourse(course);
                enrollment.setProgress(random.nextDouble() * 100); // 0-100%
                enrollment.setEnrollmentAt(LocalDateTime.now().minusDays(random.nextInt(60)));
                enrollments.add(enrollmentRepository.save(enrollment));
            }
        }

        return enrollments;
    }

    private List<Post> createPosts(List<User> users, List<Course> courses, List<Lesson> lessons) {
        List<Post> posts = new ArrayList<>();

        // Chỉ tạo 4 posts đơn giản, không có reply hay tương tác
        String[][] postData = {
                { "Tips học lập trình hiệu quả", "Chia sẻ kinh nghiệm học code từ cơ bản" },
                { "Roadmap Backend Developer 2026", "Lộ trình trở thành Backend Dev chuyên nghiệp" },
                { "So sánh Java vs Python", "Ngôn ngữ nào phù hợp cho người mới?" },
                { "Git cơ bản cho beginners", "Hướng dẫn sử dụng Git và GitHub" }
        };

        for (int i = 0; i < postData.length; i++) {
            Post post = new Post();
            post.setTitle(postData[i][0]);
            post.setContent(postData[i][1]);
            post.setUser(users.get(1 + random.nextInt(users.size() - 1))); // Không dùng admin
            post.setImageUrl(null);
            post.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(10)));
            posts.add(postRepository.save(post));
        }

        return posts;
    }

    private void createCommentsAndReactions(List<User> users, List<Post> posts) {
        // Không tạo comments và reactions
        log.info("⏭️ Bỏ qua tạo comments và reactions");
    }

    private List<Quiz> createQuizzes(List<User> users) {
        List<Quiz> quizzes = new ArrayList<>();
        List<User> teachers = users.stream().filter(u -> u.getRole() == Role.TEACHER).toList();

        String[][] quizData = {
                { "Java Basics Quiz", "Kiểm tra kiến thức cơ bản về Java", "Lập trình Java", "EASY" },
                { "React Hooks Advanced", "Quiz nâng cao về React Hooks", "React.js", "HARD" },
                { "SQL Query Optimization", "Tối ưu hóa câu truy vấn SQL", "Database", "MEDIUM" },
                { "Python Data Structures", "Cấu trúc dữ liệu trong Python", "Python", "EASY" },
                { "Spring Boot Security", "Bảo mật trong Spring Boot", "Spring Framework", "HARD" },
                { "Docker Fundamentals", "Kiến thức cơ bản về Docker", "DevOps", "MEDIUM" },
                { "Machine Learning Basics", "Cơ bản về Machine Learning", "AI/ML", "MEDIUM" },
                { "API Design Principles", "Nguyên tắc thiết kế API", "Software Architecture", "HARD" },
                { "Git Version Control", "Quản lý version với Git", "Development Tools", "EASY" },
                { "MongoDB Query Language", "Ngôn ngữ truy vấn MongoDB", "NoSQL Database", "MEDIUM" }
        };

        for (int i = 0; i < quizData.length; i++) {
            Quiz quiz = new Quiz();
            quiz.setTitle(quizData[i][0]);
            quiz.setDescription(quizData[i][1]);
            quiz.setCreatedBy(teachers.get(i % teachers.size()));
            quiz.setSubject(quizData[i][2]);
            quiz.setDifficultyLevel(DifficultyLevel.valueOf(quizData[i][3]));
            quiz.setNumberOfQuestions(5 + random.nextInt(11)); // 5-15 questions
            quiz.setIsPublic(random.nextBoolean());
            quiz.setOriginalFileName("quiz_" + i + ".pdf");
            quiz.setFileUrl("https://example.com/files/quiz_" + i + ".pdf");
            quiz.setFileType("PDF");

            Quiz savedQuiz = quizRepository.save(quiz);

            // Tạo questions cho quiz
            createQuestionsForQuiz(savedQuiz);

            quizzes.add(savedQuiz);
        }

        return quizzes;
    }

    private void createQuestionsForQuiz(Quiz quiz) {
        String[][] questionTemplates = {
                { "Khái niệm nào sau đây đúng về %s?", "Đây là khái niệm đúng", "Khái niệm sai 1", "Khái niệm sai 2",
                        "Khái niệm sai 3" },
                { "Cách nào là best practice khi làm việc với %s?", "Best practice đúng", "Cách không tốt 1",
                        "Cách không tốt 2", "Cách không tốt 3" },
                { "Điều gì xảy ra khi bạn thực hiện %s?", "Kết quả đúng", "Kết quả sai 1", "Kết quả sai 2",
                        "Kết quả sai 3" },
                { "%s được sử dụng trong trường hợp nào?", "Trường hợp đúng", "Trường hợp sai 1", "Trường hợp sai 2",
                        "Trường hợp sai 3" },
                { "Ưu điểm chính của %s là gì?", "Ưu điểm đúng", "Không phải ưu điểm 1", "Không phải ưu điểm 2",
                        "Không phải ưu điểm 3" }
        };

        for (int i = 0; i < quiz.getNumberOfQuestions(); i++) {
            Question question = new Question();
            question.setQuiz(quiz);
            String[] template = questionTemplates[i % questionTemplates.length];
            question.setQuestionText(String.format(template[0], quiz.getSubject()));
            question.setCorrectAnswerIndex(0); // First option is correct
            question.setPoints(10);
            question.setQuestionOrder(i + 1);

            Question savedQuestion = questionRepository.save(question);

            // Tạo answer options
            for (int j = 1; j < template.length; j++) {
                AnswerOption option = new AnswerOption();
                option.setQuestion(savedQuestion);
                option.setOptionText(template[j]);
                option.setOptionIndex(j - 1);
                answerOptionRepository.save(option);
            }
        }
    }

    private void createQuizAttempts(List<User> users, List<Quiz> quizzes) {
        List<User> students = users.stream().filter(u -> u.getRole() == Role.STUDENT).toList();

        for (User student : students) {
            // Mỗi student làm 1-3 quizzes
            int numAttempts = 1 + random.nextInt(3);
            List<Quiz> selectedQuizzes = new ArrayList<>(quizzes);

            for (int i = 0; i < Math.min(numAttempts, selectedQuizzes.size()); i++) {
                Quiz quiz = selectedQuizzes.remove(random.nextInt(selectedQuizzes.size()));

                QuizAttempt attempt = new QuizAttempt();
                attempt.setUser(student);
                attempt.setQuiz(quiz);
                attempt.setStartedAt(LocalDateTime.now().minusDays(random.nextInt(15)));
                attempt.setCompletedAt(attempt.getStartedAt().plusMinutes(20 + random.nextInt(40)));

                // Calculate score (70-100%)
                int maxScore = quiz.getQuestions().size() * 10;
                int earnedScore = (int) (maxScore * (0.7 + random.nextDouble() * 0.3));
                attempt.setTotalScore(earnedScore);
                attempt.setMaxScore(maxScore);
                attempt.setPercentage((double) earnedScore / maxScore * 100);
                attempt.setIsCompleted(true);

                quizAttemptRepository.save(attempt);
            }
        }
    }

    private void createPayments(List<User> users, List<Course> courses) {
        List<User> students = users.stream().filter(u -> u.getRole() == Role.STUDENT).toList();
        List<Course> approvedCourses = courses.stream()
                .filter(c -> c.getStatus() == CourseStatus.APPROVED)
                .toList();

        PaymentStatus[] statuses = { PaymentStatus.SUCCESS, PaymentStatus.SUCCESS, PaymentStatus.PENDING,
                PaymentStatus.FAILED };

        for (int i = 0; i < 20; i++) {
            Payment payment = new Payment();
            payment.setUser(students.get(random.nextInt(students.size())));
            payment.setCourse(approvedCourses.get(random.nextInt(approvedCourses.size())));
            payment.setAmount(payment.getCourse().getPrice());
            payment.setStatus(statuses[random.nextInt(statuses.length)]);
            payment.setOrderCode(System.currentTimeMillis() + i);
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                payment.setPaidAt(LocalDateTime.now().minusDays(random.nextInt(30)));
            }
            paymentRepository.save(payment);
        }
    }

    private void createNotifications(List<User> users, List<Course> courses, List<Post> posts) {
        String[][] notificationTemplates = {
                { "COURSE_APPROVED", "Khóa học '%s' của bạn đã được phê duyệt!" },
                { "COURSE_REJECTED", "Khóa học '%s' của bạn bị từ chối. Vui lòng kiểm tra lý do." },
                { "NEW_ENROLLMENT", "Có học viên mới đăng ký khóa học '%s' của bạn" },
                { "NEW_COMMENT", "Có người vừa comment trên bài viết '%s' của bạn" },
                { "PAYMENT_SUCCESS", "Thanh toán thành công cho khóa học '%s'" },
                { "COURSE_REMINDER", "Bạn chưa hoàn thành khóa học '%s'. Hãy tiếp tục học nhé!" }
        };

        for (User user : users) {
            // Tạo 3-8 notifications cho mỗi user
            int numNotifications = 3 + random.nextInt(6);
            for (int i = 0; i < numNotifications; i++) {
                Notification notification = new Notification();
                notification.setRecipient(user);

                String[] template = notificationTemplates[random.nextInt(notificationTemplates.length)];
                notification.setType(NotificationType.valueOf(template[0]));
                notification.setTitle(template[0].replace("_", " "));

                if (template[0].contains("COURSE")) {
                    Course course = courses.get(random.nextInt(courses.size()));
                    notification.setMessage(String.format(template[1], course.getTitle()));
                    notification.setCourse(course);
                } else if (template[0].contains("COMMENT")) {
                    Post post = posts.get(random.nextInt(posts.size()));
                    notification.setMessage(String.format(template[1], post.getTitle()));
                } else if (template[0].contains("PAYMENT")) {
                    Course course = courses.get(random.nextInt(courses.size()));
                    notification.setMessage(String.format(template[1], course.getTitle()));
                    notification.setCourse(course);
                } else {
                    notification.setMessage(template[1]);
                }

                notification.setIsRead(random.nextBoolean());
                notificationRepository.save(notification);
            }
        }
    }

    private void createNotes(List<User> users, List<Lesson> lessons) {
        List<User> students = users.stream().filter(u -> u.getRole() == Role.STUDENT).toList();

        String[] noteContents = {
                "Cần nhớ: Khái niệm này rất quan trọng cho phần sau",
                "TODO: Thực hành lại phần này sau khi học xong",
                "Ví dụ hay: Có thể áp dụng vào dự án thực tế",
                "Lưu ý: Có thể gây lỗi nếu không cẩn thận",
                "Best practice: Nên làm theo cách này",
                "Tham khảo thêm: Link tài liệu bổ sung",
                "Câu hỏi: Cần hỏi giảng viên về phần này",
                "Đã hiểu: Phần này đã clear rồi",
                "Khó: Cần xem lại video này nhiều lần",
                "Đã làm bài tập: Practice makes perfect!"
        };

        for (User student : students) {
            // Mỗi student tạo 5-15 notes
            int numNotes = 5 + random.nextInt(11);
            for (int i = 0; i < numNotes; i++) {
                if (lessons.isEmpty())
                    break;

                Note note = new Note();
                note.setUser(student);
                note.setLesson(lessons.get(random.nextInt(lessons.size())));
                note.setContent(noteContents[random.nextInt(noteContents.length)]);
                noteRepository.save(note);
            }
        }
    }

    private void printTestAccounts() {
        log.info("\n" +
                "╔══════════════════════════════════════════════════════════════╗\n" +
                "║           TÀI KHOẢN TEST - LEARNVERSE SYSTEM                 ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║ 👨‍💼 ADMIN:                                                    ║\n" +
                "║    Email: admin@learnverse.com                               ║\n" +
                "║    Password: admin123                                        ║\n" +
                "║                                                              ║\n" +
                "║ 👨‍🏫 TEACHER (Giảng viên):                                     ║\n" +
                "║    Email: teacher@learnverse.com                             ║\n" +
                "║    Password: teacher123                                      ║\n" +
                "║                                                              ║\n" +
                "║ 👨‍🎓 STUDENT (Học viên):                                       ║\n" +
                "║    Email: student1@learnverse.com (đến student8)             ║\n" +
                "║    Password: student123                                      ║\n" +
                "║                                                              ║\n" +
                "║ 📊 THỐNG KÊ DỮ LIỆU:                                          ║\n" +
                "║    - 10 Users (1 Admin, 1 Teacher, 8 Students)               ║\n" +
                "║    - 15 Courses (giá 2000-3000 VND)                          ║\n" +
                "║    - 5-7 Lessons/course                                      ║\n" +
                "║    - 4 Posts (không có comments/reactions)                   ║\n" +
                "╚══════════════════════════════════════════════════════════════╝");
    }
}
