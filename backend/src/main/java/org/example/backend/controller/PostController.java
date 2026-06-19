package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.post.CommentRequest;
import org.example.backend.dto.request.post.PostRequest;
import org.example.backend.dto.request.post.ReactionRequest;
import org.example.backend.dto.response.dashboard.BlogStatsResponse;
import org.example.backend.dto.response.post.CommentResponse;
import org.example.backend.dto.response.post.PostResponse;
import org.example.backend.dto.response.community.TopContributorResponse;
import org.example.backend.dto.response.community.TrendingTopicResponse;
import org.example.backend.entity.Post;
import org.example.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    @PostMapping("/posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest request, Principal principal){
        Post createdPost = postService.createPost(principal.getName(), request);
        // Query lại từ database để đảm bảo có đầy đủ dữ liệu và tránh lazy loading issues
        return ResponseEntity.ok(postService.getPostResponseById(createdPost.getId(), principal.getName()));
    }
    @PostMapping("/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponse> createComment(@RequestBody CommentRequest request, Principal principal) {
        return ResponseEntity.ok(postService.createComment(principal.getName(), request));
    }
    @PostMapping("/reactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> reaction(@RequestBody ReactionRequest request, Principal principal) {
        postService.actionReaction(principal.getName(), request);
        return ResponseEntity.ok("Success");
    }

    @PostMapping("/comments/{commentId}/reactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> commentReaction(@PathVariable Long commentId, @RequestBody ReactionRequest request, Principal principal) {
        // Tạo request mới với commentId
        ReactionRequest commentReactionRequest = new ReactionRequest(null, commentId, request.type());
        postService.actionReaction(principal.getName(), commentReactionRequest);
        return ResponseEntity.ok("Success");
    }

    @GetMapping("/posts/community")
    public ResponseEntity<List<PostResponse>> getCommunityPosts(Principal principal) {
        // Nếu chưa đăng nhập (principal null) vẫn xem được, nhưng nút like sẽ xám
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(postService.getGlobalPosts(email));
    }
    @GetMapping("/courses/{courseId}/posts")
    public ResponseEntity<List<PostResponse>> getCoursePosts(@PathVariable Long courseId, Principal principal) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(postService.getCoursePosts(courseId, email));
    }
    @GetMapping("/lessons/{lessonId}/posts")
    public ResponseEntity<List<PostResponse>> getLessonPosts(@PathVariable Long lessonId, Principal principal) {
        String email = (principal != null) ? principal.getName() : null;
        return ResponseEntity.ok(postService.getLessonPosts(lessonId, email));
    }
    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deletePost(@PathVariable Long postId, Principal principal) {
        postService.deletePost(postId, principal.getName());
        return ResponseEntity.ok("Xóa bài viết thành công!");
    }
    @PutMapping("/posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> updatePost(@PathVariable Long postId, @RequestBody PostRequest request, Principal principal) {
        return ResponseEntity.ok(postService.updatePost(postId, principal.getName(), request));
    }

    @PostMapping("/posts/{postId}/best-answer/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> markBestAnswer(@PathVariable Long postId, @PathVariable Long commentId, Principal principal) {
        postService.markBestAnswer(postId, commentId, principal.getName());
        return ResponseEntity.ok("Success");
    }

    @GetMapping("/posts/my-posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponse>> getMyPosts(Principal principal) {
        return ResponseEntity.ok(postService.getUserPosts(principal.getName()));
    }

    @GetMapping("/posts/stats")
    public ResponseEntity<BlogStatsResponse> getBlogStats() {
        return ResponseEntity.ok(postService.getBlogStats());
    }

    @GetMapping("/posts/trending-topics")
    public ResponseEntity<List<TrendingTopicResponse>> getTrendingTopics(
            @RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(postService.getTrendingTopics(limit));
    }

    @GetMapping("/posts/top-contributors")
    public ResponseEntity<List<TopContributorResponse>> getTopContributors(
            @RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(postService.getTopContributors(limit));
    }
}
//