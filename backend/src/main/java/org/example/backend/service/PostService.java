package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.post.CommentRequest;
import org.example.backend.dto.request.post.PostRequest;
import org.example.backend.dto.request.post.ReactionRequest;
import org.example.backend.dto.response.dashboard.BlogStatsResponse;
import org.example.backend.dto.response.post.CommentResponse;
import org.example.backend.dto.response.community.ContributionDataResponse;
import org.example.backend.dto.response.post.PostResponse;
import org.example.backend.dto.response.community.TopContributorResponse;
import org.example.backend.dto.response.community.TrendingTopicResponse;
import org.example.backend.dto.response.dashboard.UserStatisticsResponse;
import org.example.backend.enums.CourseStatus;
import org.example.backend.entity.*;
import org.example.backend.enums.ReactionType;
import org.example.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReactionRepository reactionRepository;
    private final UserProfileRepository userProfileRepository;
    private final NotificationService notificationService;

    public Post createPost(String userEmail, PostRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = new Post();
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setImageUrl(request.imageUrl()); // Lưu imageUrl nếu có
        post.setUser(user);
        if (request.courseId() != null) {
            Course course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            boolean isAdmin = user.getRole() == org.example.backend.enums.Role.ADMIN;
            boolean isOwner = course.getTeacher().getId().equals(user.getId());
            boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(user.getId(), course.getId());
            if (!isAdmin && !isOwner && !isEnrolled) {
                throw new RuntimeException("Bạn không có quyền đăng bài trong khóa học này!");
            }
            post.setCourse(course);
        }
        if (request.lessonId() != null) {
            Lesson lesson = lessonRepository.findById(request.lessonId())
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            post.setLesson(lesson);
        }
        Post savedPost = postRepository.save(post);
        // Flush để đảm bảo post được lưu vào database trước khi query lại
        postRepository.flush();
        return savedPost;
    }

    public CommentResponse createComment(String userEmail, CommentRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(request.postId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setImageUrl(request.imageUrl()); // Lưu imageUrl nếu có
        comment.setUser(user);
        comment.setPost(post);

        // Xử lý reply và tạo notification
        if (request.parentCommentId() != null) {
            Comment parentComment = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parentComment);

            // Tạo notification cho người được reply (nếu không phải tự reply chính mình)
            if (!parentComment.getUser().getId().equals(user.getId())) {
                notificationService.notifyCommentReply(parentComment, comment);
            }
        }

        Comment savedComment = commentRepository.save(comment);

        return mapToCommentResponse(savedComment, null, null);
    }

    // cải tiến sau bằng overloading
    public List<PostResponse> getGlobalPosts(String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        List<Post> posts = postRepository.findByCourseIdIsNullAndLessonIdIsNullOrderByCreatedAtDesc();
        List<PostResponse> responses = new ArrayList<>();
        for (Post post : posts)
            responses.add(mapToPostResponse(post, currentUser));
        return responses;
    }

    public List<PostResponse> getCoursePosts(Long courseId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        List<Post> posts = postRepository.findByCourseIdAndLessonIdIsNullOrderByCreatedAtDesc(courseId);
        List<PostResponse> responseList = new ArrayList<>();
        for (Post post : posts)
            responseList.add(mapToPostResponse(post, currentUser));
        return responseList;
    }

    public List<PostResponse> getLessonPosts(Long lessonId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        List<Post> posts = postRepository.findByLessonIdOrderByCreatedAtDesc(lessonId);
        List<PostResponse> responseList = new ArrayList<>();
        for (Post post : posts)
            responseList.add(mapToPostResponse(post, currentUser));
        return responseList;
    }

    public List<PostResponse> getUserPosts(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = user; // User xem posts của chính mình
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<PostResponse> responseList = new ArrayList<>();
        for (Post post : posts)
            responseList.add(mapToPostResponse(post, currentUser));
        return responseList;
    }

    /**
     * Lấy PostResponse từ Post ID
     * Dùng để convert Post entity thành PostResponse sau khi tạo mới
     */
    public PostResponse getPostResponseById(Long postId, String currentUserEmail) {
        // Refresh entity từ database để đảm bảo có đầy đủ dữ liệu
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        return mapToPostResponse(post, currentUser);
    }

    /// Khong dung den, check lai sau
    // /**
    // * Map Post entity trực tiếp thành PostResponse (dùng cho post mới tạo)
    // * Tránh lazy loading issues bằng cách xử lý collections một cách an toàn
    // */
    // public PostResponse mapPostToResponseDirectly(Post post, String
    // currentUserEmail) {
    // User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
    // return mapToPostResponse(post, currentUser);
    // }
    private PostResponse mapToPostResponse(Post post, User currentUser) {
        // Lấy avatarUrl từ UserProfile nếu có
        Optional<UserProfile> userProfile = userProfileRepository.findByUserId(post.getUser().getId());
        String userAvatarUrl = userProfile.isPresent() && userProfile.get().getAvatarUrl() != null
                ? userProfile.get().getAvatarUrl()
                : null;

        Long courseId = post.getCourse() != null ? post.getCourse().getId() : null;
        Long lessonId = post.getLesson() != null ? post.getLesson().getId() : null;

        // Xử lý an toàn với collections để tránh lazy loading issues
        Long totalComments = 0L;
        Long totalReactions = 0L;
        try {
            totalComments = post.getComments() != null ? (long) post.getComments().size() : 0L;
            totalReactions = post.getReactions() != null ? (long) post.getReactions().size() : 0L;
        } catch (Exception e) {
            // Nếu gặp lazy loading exception, giữ về 0
        }

        Long bestAnswerId = post.getBestAnswer() != null ? post.getBestAnswer().getId() : null;

        boolean isReacted = false;
        org.example.backend.enums.ReactionType myReactionType = null;
        if (currentUser != null) {
            Optional<Reaction> myReaction = reactionRepository.findByUserIdAndPostId(currentUser.getId(), post.getId());
            if (myReaction.isPresent()) {
                myReactionType = myReaction.get().getType();
                isReacted = true;
            }
        }

        // Load comments từ repository thay vì từ post.getComments() để tránh lazy
        // loading issues
        List<CommentResponse> commentResponses = new ArrayList<>();
        try {
            List<Comment> rootComments = commentRepository
                    .findByPostIdAndParentIsNullOrderByCreatedAtDesc(post.getId());
            for (Comment comment : rootComments) {
                CommentResponse commentResponse = mapToCommentResponse(comment, bestAnswerId, currentUser);
                commentResponses.add(commentResponse);
            }
        } catch (Exception e) {
            // Nếu gặp lỗi khi load comments, giữ empty list
        }

        // Tính reaction breakdown (số lượng từng loại reaction)
        Map<ReactionType, Long> reactionBreakdown = new HashMap<>();
        try {
            List<Reaction> reactions = reactionRepository.findByPostId(post.getId());
            reactionBreakdown = reactions.stream()
                    .collect(Collectors.groupingBy(Reaction::getType, Collectors.counting()));
        } catch (Exception e) {
            // Nếu gặp lỗi, giữ empty map
        }

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getUser().getId(),
                post.getUser().getFullName(),
                userAvatarUrl,
                post.getUser().getRole(),
                courseId,
                lessonId,
                post.getImageUrl(),
                totalReactions,
                reactionBreakdown,
                totalComments,
                isReacted,
                myReactionType,
                bestAnswerId,
                commentResponses,
                post.getCreatedAt());
    }

    private CommentResponse mapToCommentResponse(Comment comment, Long bestAnswerId, User currentUser) {
        // Lấy avatarUrl từ UserProfile nếu có
        Optional<UserProfile> userProfile = userProfileRepository.findByUserId(comment.getUser().getId());
        String userAvatarUrl = userProfile.isPresent() && userProfile.get().getAvatarUrl() != null
                ? userProfile.get().getAvatarUrl()
                : null;

        Boolean isBestAnswer = bestAnswerId != null && comment.getId().equals(bestAnswerId);

        // Set reaction info
        Long totalReactions = reactionRepository.countByCommentId(comment.getId());
        if (totalReactions == null)
            totalReactions = 0L;

        // Tính reaction breakdown cho comment
        Map<ReactionType, Long> reactionBreakdown = new HashMap<>();
        try {
            List<Reaction> reactions = reactionRepository.findByCommentId(comment.getId());
            reactionBreakdown = reactions.stream()
                    .collect(Collectors.groupingBy(Reaction::getType, Collectors.counting()));
        } catch (Exception e) {
            // Nếu gặp lỗi, giữ empty map
        }

        boolean isReacted = false;
        ReactionType myReactionType = null;
        if (currentUser != null) {
            Optional<Reaction> myReaction = reactionRepository.findByUserIdAndCommentId(currentUser.getId(),
                    comment.getId());
            if (myReaction.isPresent()) {
                myReactionType = myReaction.get().getType();
                isReacted = true;
            }
        }

        List<CommentResponse> replyResponses = new ArrayList<>();
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            for (Comment reply : comment.getReplies()) {
                CommentResponse replyResponse = mapToCommentResponse(reply, bestAnswerId, currentUser);
                replyResponses.add(replyResponse);
            }
        }

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getImageUrl(),
                comment.getUser().getId(),
                comment.getUser().getFullName(),
                userAvatarUrl,
                comment.getUser().getRole(),
                comment.getCreatedAt(),
                isBestAnswer,
                totalReactions,
                reactionBreakdown,
                isReacted,
                myReactionType,
                replyResponses);
    }

    public void actionReaction(String userEmail, ReactionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.postId() != null) {
            // Reaction cho post
            Post post = postRepository.findById(request.postId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndPostId(user.getId(), post.getId());
            if (existingReaction.isPresent()) {
                Reaction reaction = existingReaction.get();
                if (reaction.getType() == request.type()) {
                    reactionRepository.delete(reaction);
                } else {
                    reaction.setType(request.type());
                    reactionRepository.save(reaction);
                }
            } else {
                Reaction newReaction = new Reaction();
                newReaction.setUser(user);
                newReaction.setPost(post);
                newReaction.setType(request.type());
                reactionRepository.save(newReaction);
            }
        } else if (request.commentId() != null) {
            // Reaction cho comment
            Comment comment = commentRepository.findById(request.commentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            Optional<Reaction> existingReaction = reactionRepository.findByUserIdAndCommentId(user.getId(),
                    comment.getId());
            if (existingReaction.isPresent()) {
                Reaction reaction = existingReaction.get();
                if (reaction.getType() == request.type()) {
                    reactionRepository.delete(reaction);
                } else {
                    reaction.setType(request.type());
                    reactionRepository.save(reaction);
                }
            } else {
                Reaction newReaction = new Reaction();
                newReaction.setUser(user);
                newReaction.setComment(comment);
                newReaction.setType(request.type());
                reactionRepository.save(newReaction);
            }
        } else {
            throw new RuntimeException("Phải có postId hoặc commentId!");
        }
    }

    public void deletePost(Long postId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        boolean isAuthor = post.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == org.example.backend.enums.Role.ADMIN;
        boolean isCourseOwner = false;
        if (post.getCourse() != null) {
            isCourseOwner = post.getCourse().getTeacher().getId().equals(user.getId());
        }
        if (!isAuthor && !isAdmin && !isCourseOwner) {
            throw new RuntimeException("Bạn không có quyền xóa bài viết này!");
        }
        postRepository.delete(post);
    }

    public Post updatePost(Long postId, String userEmail, PostRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        boolean isAuthor = post.getUser().getId().equals(user.getId());
        if (!isAuthor) {
            throw new RuntimeException("Bạn không có quyền sửa bài viết của người khác!");
        }
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setImageUrl(request.imageUrl()); // Cập nhật imageUrl khi edit
        return postRepository.save(post);
    }

    /**
     * Đánh dấu một comment là best answer cho post
     * Chỉ author của post hoặc admin mới có quyền đánh dấu best answer
     */
    public void markBestAnswer(Long postId, Long commentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Kiểm tra comment có thuộc về post này không (kiểm tra bằng cách so sánh
        // postId trực tiếp)
        // Tránh lazy loading issue bằng cách kiểm tra comment có trong danh sách
        // comments của post
        boolean commentBelongsToPost = post.getComments().stream()
                .anyMatch(c -> c.getId().equals(commentId));
        if (!commentBelongsToPost) {
            throw new RuntimeException("Comment không thuộc về post này!");
        }

        // Kiểm tra quyền: chỉ author của post hoặc admin mới được đánh dấu best answer
        boolean isAuthor = post.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == org.example.backend.enums.Role.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền đánh dấu best answer cho post này!");
        }

        // Nếu comment đã là best answer thì unmark, ngược lại thì mark
        if (post.getBestAnswer() != null && post.getBestAnswer().getId().equals(commentId)) {
            // Unmark best answer
            post.setBestAnswer(null);
        } else {
            // Mark best answer
            post.setBestAnswer(comment);
        }
        postRepository.save(post);
    }

    /**
     * Lấy thống kê blog trong tuần này (số posts và comments)
     */
    public BlogStatsResponse getBlogStats() {
        LocalDateTime startOfWeek = LocalDateTime.now().with(java.time.DayOfWeek.MONDAY).truncatedTo(ChronoUnit.DAYS);
        Long postsCount = postRepository.countCommunityPostsThisWeek(startOfWeek);
        Long commentsCount = commentRepository.countCommentsThisWeek(startOfWeek);
        return new BlogStatsResponse(postsCount != null ? postsCount : 0L, commentsCount != null ? commentsCount : 0L);
    }

    /**
     * Lấy danh sách trending topics (top posts có nhiều reactions nhất)
     */
    public List<TrendingTopicResponse> getTrendingTopics(int limit) {
        List<Post> topPosts = postRepository.findTopCommunityPostsByReactions();
        List<TrendingTopicResponse> topics = new ArrayList<>();

        // Lấy top N posts
        int count = 0;
        for (Post post : topPosts) {
            if (count >= limit)
                break;

            // Tạo description từ content (lấy 50 ký tự đầu)
            String description = post.getContent();
            if (description != null && description.length() > 50) {
                description = description.substring(0, 50) + "...";
            } else if (description == null) {
                description = "No description";
            }

            topics.add(new TrendingTopicResponse(
                    post.getId(),
                    post.getTitle(),
                    description,
                    (long) post.getReactions().size()));
            count++;
        }

        return topics;
    }

    /**
     * Lấy danh sách top contributors (users có nhiều posts + comments nhất)
     */
    public List<TopContributorResponse> getTopContributors(int limit) {
        // Lấy tất cả community posts
        List<Post> allPosts = postRepository.findByCourseIdIsNullAndLessonIdIsNullOrderByCreatedAtDesc();

        // Đếm số lượng posts và comments của mỗi user
        Map<Long, Long> userPostCounts = allPosts.stream()
                .collect(Collectors.groupingBy(
                        post -> post.getUser().getId(),
                        Collectors.counting()));

        // Lấy tất cả comments từ community posts
        Map<Long, Long> userCommentCounts = new java.util.HashMap<>();
        for (Post post : allPosts) {
            for (Comment comment : post.getComments()) {
                userCommentCounts.merge(comment.getUser().getId(), 1L, Long::sum);
            }
        }

        // Tính tổng contributions (posts + comments) cho mỗi user
        Map<Long, Long> userContributions = new java.util.HashMap<>();
        userPostCounts.forEach(
                (userId, count) -> userContributions.put(userId, count + userCommentCounts.getOrDefault(userId, 0L)));

        userCommentCounts.forEach((userId, count) -> userContributions.merge(userId, count, Long::sum));

        // Sort theo contributions giảm dần và lấy top N
        List<Map.Entry<Long, Long>> sortedContributors = userContributions.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toList());

        List<TopContributorResponse> topContributors = new ArrayList<>();
        for (Map.Entry<Long, Long> entry : sortedContributors) {
            User user = userRepository.findById(entry.getKey())
                    .orElse(null);
            if (user == null)
                continue;

            // Lấy avatarUrl từ UserProfile
            Optional<UserProfile> userProfile = userProfileRepository.findByUserId(user.getId());
            String avatarUrl = userProfile.isPresent() && userProfile.get().getAvatarUrl() != null
                    ? userProfile.get().getAvatarUrl()
                    : null;

            topContributors.add(new TopContributorResponse(
                    user.getId(),
                    user.getFullName(),
                    avatarUrl,
                    user.getRole(),
                    entry.getValue()));
        }

        return topContributors;
    }

    /// khong dung den
    // /**
    // * Lấy thống kê của user (posts, comments, courses approved)
    // */
    public UserStatisticsResponse getUserStatistics(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Đếm số posts
        Long postsCount = (long) postRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size();

        // Đếm số comments
        Long commentsCount = commentRepository.countByUserId(user.getId());

        // Đếm số courses được duyệt (chỉ cho instructor)
        Long coursesApprovedCount = 0L;
        if (user.getRole() == org.example.backend.enums.Role.TEACHER) {
            List<Course> teacherCourses = courseRepository.findByTeacherId(user.getId());
            coursesApprovedCount = (long) teacherCourses.stream()
                    .filter(course -> course.getStatus() == CourseStatus.APPROVED)
                    .count();
        }

        // Tổng contributions
        Long totalContributions = postsCount + commentsCount + coursesApprovedCount;

        return new UserStatisticsResponse(postsCount, commentsCount, coursesApprovedCount, totalContributions);
    }

    //
    // /**
    // * Lấy dữ liệu contribution theo ngày trong 1 năm gần nhất (cho heatmap)
    // */
    public List<ContributionDataResponse> getUserContributionData(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(1);

        // Map để lưu contributions theo ngày
        Map<LocalDate, Long> contributionsByDate = new HashMap<>();

        // Khởi tạo tất cả các ngày trong năm với 0 contributions
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            contributionsByDate.put(currentDate, 0L);
            currentDate = currentDate.plusDays(1);
        }

        // Đếm posts theo ngày
        List<Post> userPosts = postRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Post post : userPosts) {
            if (post.getCreatedAt() != null) {
                LocalDate postDate = post.getCreatedAt().toLocalDate();
                if (postDate.isAfter(startDate.minusDays(1)) && !postDate.isAfter(endDate)) {
                    contributionsByDate.merge(postDate, 1L, Long::sum);
                }
            }
        }

        // Đếm comments theo ngày
        List<Comment> userComments = commentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Comment comment : userComments) {
            if (comment.getCreatedAt() != null) {
                LocalDate commentDate = comment.getCreatedAt().toLocalDate();
                if (commentDate.isAfter(startDate.minusDays(1)) && !commentDate.isAfter(endDate)) {
                    contributionsByDate.merge(commentDate, 1L, Long::sum);
                }
            }
        }

        // Đếm courses được duyệt theo ngày (chỉ cho instructor)
        if (user.getRole() == org.example.backend.enums.Role.TEACHER) {
            List<Course> teacherCourses = courseRepository.findByTeacherId(user.getId());
            for (Course course : teacherCourses) {
                if (course.getStatus() == CourseStatus.APPROVED && course.getUpdatedAt() != null) {
                    LocalDate courseDate = course.getUpdatedAt().toLocalDate();
                    if (courseDate.isAfter(startDate.minusDays(1)) && !courseDate.isAfter(endDate)) {
                        contributionsByDate.merge(courseDate, 1L, Long::sum);
                    }
                }
            }
        }

        // Convert map thành list và sort theo date
        return contributionsByDate.entrySet().stream()
                .map(entry -> new ContributionDataResponse(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .collect(Collectors.toList());
    }
}
