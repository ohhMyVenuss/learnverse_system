import React, { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/home/Footer';
import postApi from '../api/postApi';

// Components
import BlogHeader from '../components/blog/BlogHeader';
import PostFilters from '../components/blog/PostFilters';
import SidebarStats from '../components/blog/SidebarStats';
import CreatePostForm from '../components/blog/CreatePostForm';
import PostCard from '../components/blog/PostCard';

// Utils
import { mapPostFromApi, mapCommentFromApi } from '../utils/blogMappers';
import { uploadImage } from '../utils/cloudinaryUpload';

/**
 * BlogPage - Trang blog & discussion hub chính
 * 
 * Chức năng:
 * - Load và hiển thị danh sách bài viết cộng đồng
 * - Tạo bài viết mới
 * - Comment và reply (cấu trúc cây)
 * - Like/Reaction
 * - Search và filter
 */
function BlogPage() {
  // State management
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: '',
    imageFile: null,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeReplyForms, setActiveReplyForms] = useState(new Set()); // Track các comment đang mở reply form
  const [activeCommentForms, setActiveCommentForms] = useState(new Set()); // Track các post đang mở comment form
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  /**
   * Load danh sách bài viết từ backend
   */
  const loadCommunityPosts = async () => {
    try {
      const data = await postApi.getCommunityPosts();
      setPosts(data.map(mapPostFromApi));
    } catch (error) {
      console.error('Failed to load community posts', error);
    }
  };

  // Load posts khi component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        await loadCommunityPosts();
      } catch (error) {
        console.error('Failed to load community posts', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  /**
   * Filter posts dựa trên search term và active filter
   */
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'trending') return post.upvotes >= 25;
      if (activeFilter === 'answered') return Boolean(post.bestAnswerId);
      if (activeFilter === 'unanswered') return !post.bestAnswerId;
      return true;
    });
  }, [posts, searchTerm, activeFilter]);

  /**
   * Handler tạo bài viết mới
   */
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    setIsPublishing(true);

    try {
      // Upload ảnh lên Cloudinary trước (nếu có)
      let imageUrl = null;
      if (newPost.imageFile) {
        try {
          imageUrl = await uploadImage(newPost.imageFile);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          alert('Failed to upload image. Please try again.');
          setIsPublishing(false);
          return;
        }
      }

      // Gửi post lên backend với imageUrl
      const created = await postApi.createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        imageUrl: imageUrl,
      });

      const mapped = mapPostFromApi(created);
      setPosts((prev) => [mapped, ...prev]);
      setNewPost({
        title: '',
        content: '',
        tags: '',
        imageFile: null,
      });
    } catch (error) {
      console.error('Failed to publish post', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Handler thay đổi comment draft
   */
  const handleCommentDraftChange = (postId, field, value) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: {
        content: '',
        imageFile: null,
        isSubmitting: false,
        ...(prev[postId] || {}),
        [field]: value,
      },
    }));
  };

  /**
   * Handler thay đổi reply draft
   * @param {number|string} commentId - ID của comment
   * @param {string|undefined} content - Nội dung mới (undefined để giữ nguyên)
   * @param {File|null|undefined} imageFile - File ảnh mới (undefined để giữ nguyên, null để xóa)
   */
  const handleReplyDraftChange = (commentId, content, imageFile) => {
    setReplyDrafts((prev) => {
      const currentDraft = prev[commentId] || { content: '', imageFile: null, isSubmitting: false };
      return {
        ...prev,
        [commentId]: {
          content: content !== undefined ? content : currentDraft.content,
          imageFile: imageFile !== undefined ? imageFile : currentDraft.imageFile,
          isSubmitting: currentDraft.isSubmitting || false,
        },
      };
    });
  };

  /**
   * Handler thêm comment (root comment)
   */
  const handleAddComment = async (postId) => {
    const draft = commentDrafts[postId];
    if (!draft?.content?.trim()) return;

    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        isSubmitting: true,
      },
    }));

    try {
      // Upload ảnh lên Cloudinary trước (nếu có)
      let imageUrl = null;
      if (draft.imageFile) {
        try {
          imageUrl = await uploadImage(draft.imageFile);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          setCommentDrafts((prev) => ({
            ...prev,
            [postId]: { ...(prev[postId] || {}), isSubmitting: false },
          }));
          return;
        }
      }

      const createdComment = await postApi.createComment({
        postId,
        content: draft.content.trim(),
        imageUrl: imageUrl,
        parentCommentId: null,
      });

      // Map comment mới và cập nhật UI ngay lập tức
      const mappedComment = mapCommentFromApi(createdComment);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: [...(post.comments || []), mappedComment], totalComments: (post.totalComments || 0) + 1 }
            : post
        )
      );

      // Vẫn reload để đảm bảo sync với server
      await loadCommunityPosts();

      setCommentDrafts((prev) => ({
        ...prev,
        [postId]: { content: '', imageFile: null, isSubmitting: false },
      }));

      // Đóng comment form sau khi comment thành công
      setActiveCommentForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });

      // Thông báo thành công
      alert('Comment posted successfully!');
    } catch (error) {
      console.error('Failed to send comment', error);
      alert('Failed to post comment. Please try again.');
      setCommentDrafts((prev) => ({
        ...prev,
        [postId]: { ...(prev[postId] || {}), isSubmitting: false },
      }));
    }
  };

  /**
   * Handler thêm reply (nested comment)
   */
  const handleAddReply = async (postId, parentCommentId, replyingToName = '') => {
    const draft = replyDrafts[parentCommentId];
    if (!draft?.content?.trim()) return;

    setReplyDrafts((prev) => ({
      ...prev,
      [parentCommentId]: {
        ...(prev[parentCommentId] || {}),
        isSubmitting: true,
      },
    }));

    try {
      // Upload ảnh lên Cloudinary trước (nếu có)
      let imageUrl = null;
      if (draft.imageFile) {
        try {
          imageUrl = await uploadImage(draft.imageFile);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          setReplyDrafts((prev) => ({
            ...prev,
            [parentCommentId]: { ...(prev[parentCommentId] || {}), isSubmitting: false },
          }));
          return;
        }
      }

      // Tự động thêm @Tên vào đầu nội dung khi reply (giống Facebook)
      console.log('Reply debug - replyingToName:', replyingToName, 'parentCommentId:', parentCommentId);
      const finalContent = replyingToName 
        ? `@${replyingToName} ${draft.content.trim()}`
        : draft.content.trim();

      await postApi.createComment({
        postId,
        content: finalContent,
        imageUrl: imageUrl,
        parentCommentId,
      });

      await loadCommunityPosts();

      setReplyDrafts((prev) => ({
        ...prev,
        [parentCommentId]: { content: '', imageFile: null, isSubmitting: false },
      }));

      // Đóng reply form sau khi reply thành công
      setActiveReplyForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(parentCommentId);
        return newSet;
      });

      // Thông báo thành công
      alert('Reply posted successfully!');
    } catch (error) {
      console.error('Failed to send reply', error);
      alert('Failed to post reply. Please try again.');
      setReplyDrafts((prev) => ({
        ...prev,
        [parentCommentId]: { ...(prev[parentCommentId] || {}), isSubmitting: false },
      }));
    }
  };

  /**
   * Handler thay đổi reaction (giống Facebook)
   */
  const handleReactionChange = async (postId, reactionType) => {
    try {
      // Nếu reactionType là null thì không gọi API (đã được xử lý trong ReactionPicker)
      // Nếu có type thì sẽ toggle hoặc update reaction
      if (reactionType) {
        await postApi.react({ postId, type: reactionType });
      } else {
        // Xóa reaction bằng cách gửi lại type hiện tại (backend sẽ toggle)
        // Hoặc gửi một type khác rồi xóa
        const currentPost = posts.find((p) => p.id === postId);
        if (currentPost?.myReactionType) {
          await postApi.react({ postId, type: currentPost.myReactionType });
        }
      }
      await loadCommunityPosts();
    } catch (error) {
      console.error('Failed to react to post', error);
    }
  };

  /**
   * Handler mark best answer (gọi API backend)
   */
  const handleMarkBestAnswer = async (postId, commentId) => {
    try {
      await postApi.markBestAnswer({ postId, commentId });
      // Reload posts để lấy dữ liệu mới nhất từ backend
      await loadCommunityPosts();
    } catch (error) {
      console.error('Failed to mark best answer', error);
      alert(error.response?.data?.message || 'Failed to mark best answer. Please try again.');
    }
  };

  /**
   * Handler reaction cho comment (gọi API backend)
   */
  const handleCommentReactionChange = async (commentId, reactionType) => {
    try {
      if (reactionType) {
        await postApi.reactComment({ commentId, type: reactionType });
      } else {
        // Xóa reaction bằng cách gửi lại type hiện tại (backend sẽ toggle)
        // Tìm comment hiện tại để lấy reaction type
        let currentReactionType = null;
        for (const post of posts) {
          const findReaction = (comments) => {
            for (const comment of comments) {
              if (comment.id === commentId && comment.myReactionType) {
                return comment.myReactionType;
              }
              if (comment.replies && comment.replies.length > 0) {
                const found = findReaction(comment.replies);
                if (found) return found;
              }
            }
            return null;
          };
          currentReactionType = findReaction(post.comments);
          if (currentReactionType) break;
        }
        if (currentReactionType) {
          await postApi.reactComment({ commentId, type: currentReactionType });
        }
      }
      // Reload posts để lấy dữ liệu mới nhất từ backend
      await loadCommunityPosts();
    } catch (error) {
      console.error('Failed to react to comment', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      <Header />
      <main className="relative isolate overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-32 h-64 w-64 rounded-full bg-[#FEE2E2] opacity-40 blur-3xl" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#DBEAFE] opacity-40 blur-3xl" />
        </div>

        {/* Header Section */}
        <BlogHeader />

        {/* Filters Section */}
        <section className="relative z-10 -mt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-8">
              <PostFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="relative z-10 -mt-6 pb-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1fr,320px]">
            {/* Posts Column */}
            <div className="space-y-6">
              {/* Create Post Form */}
              <div className="sticky top-4 z-10">
                <CreatePostForm
                  newPost={newPost}
                  onPostChange={setNewPost}
                  onImageChange={(file) => setNewPost((prev) => ({ ...prev, imageFile: file }))}
                  onSubmit={handleCreatePost}
                  isPublishing={isPublishing}
                />
              </div>

              {/* Loading State */}
              {isLoadingPosts && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA454C]"></div>
                </div>
              )}

              {/* Posts List */}
              {!isLoadingPosts && filteredPosts.length === 0 && (
                <div className="rounded-3xl bg-white p-12 text-center shadow-xl shadow-gray-200/60">
                  <p className="text-gray-500">No posts found. Be the first to share your thoughts!</p>
                </div>
              )}

              {!isLoadingPosts &&
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReactionChange={handleReactionChange}
                    commentDrafts={commentDrafts}
                    activeCommentForms={activeCommentForms}
                    onToggleCommentForm={(postId) => {
                      setActiveCommentForms(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(postId)) {
                          newSet.delete(postId);
                        } else {
                          newSet.add(postId);
                        }
                        return newSet;
                      });
                    }}
                    onCommentDraftChange={handleCommentDraftChange}
                    onAddComment={handleAddComment}
                    replyDrafts={replyDrafts}
                    activeReplyForms={activeReplyForms}
                    onToggleReplyForm={(commentId) => {
                      setActiveReplyForms(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(commentId)) {
                          newSet.delete(commentId);
                        } else {
                          newSet.add(commentId);
                        }
                        return newSet;
                      });
                    }}
                    onReplyDraftChange={handleReplyDraftChange}
                    onAddReply={handleAddReply}
                    onMarkBestAnswer={handleMarkBestAnswer}
                    onCommentReactionChange={handleCommentReactionChange}
                  />
                ))}
            </div>

            {/* Sidebar */}
            <SidebarStats />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default BlogPage;
