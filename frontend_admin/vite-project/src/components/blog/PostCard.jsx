import React, { useState, useMemo, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import RoleBadge from './RoleBadge';
import CommentThread from './CommentThread';
import CommentForm from './CommentForm';
import ReactionPicker from './ReactionPicker';

/**
 * Component hiển thị một post card với comments
 * 
 * @param {Object} post - Post object
 * @param {Function} onReactionChange - Callback khi reaction thay đổi (type: string | null)
 * @param {Object} commentDrafts - State drafts cho comments
 * @param {Set} activeCommentForms - Set các postId đang mở comment form
 * @param {Function} onToggleCommentForm - Callback toggle comment form
 * @param {Function} onCommentDraftChange - Callback khi comment draft thay đổi
 * @param {Function} onAddComment - Callback khi submit comment
 * @param {Object} replyDrafts - State drafts cho replies
 * @param {Set} activeReplyForms - Set các commentId đang mở reply form
 * @param {Function} onToggleReplyForm - Callback toggle reply form
 * @param {Function} onReplyDraftChange - Callback khi reply draft thay đổi
 * @param {Function} onAddReply - Callback khi submit reply
 * @param {Function} onMarkBestAnswer - Callback khi mark best answer
 * @param {Function} onCommentReactionChange - Callback khi reaction comment thay đổi
 */
const PostCard = ({
  post,
  onReactionChange,
  commentDrafts,
  activeCommentForms,
  onToggleCommentForm,
  onCommentDraftChange,
  onAddComment,
  replyDrafts,
  activeReplyForms,
  onToggleReplyForm,
  onReplyDraftChange,
  onAddReply,
  onMarkBestAnswer,
  onCommentReactionChange,
}) => {
  const [showAllComments, setShowAllComments] = useState(false);

  // Reset showAllComments khi comments thay đổi (ví dụ sau khi thêm comment mới)
  useEffect(() => {
    setShowAllComments(false);
  }, [post.comments?.length]);

  // Sort comments theo tương tác (reactionsCount) giảm dần, best answer luôn ở đầu
  const sortedComments = useMemo(() => {
    if (!post.comments || post.comments.length === 0) return [];
    
    return [...post.comments].sort((a, b) => {
      // Best answer luôn ở đầu
      if (a.isBestAnswer && !b.isBestAnswer) return -1;
      if (!a.isBestAnswer && b.isBestAnswer) return 1;
      
      // Sau đó sort theo reactionsCount giảm dần
      const aReactions = a.reactionsCount || 0;
      const bReactions = b.reactionsCount || 0;
      return bReactions - aReactions;
    });
  }, [post.comments]);

  // Chỉ hiển thị 1-2 comment đầu tiên nếu chưa expand
  const displayedComments = useMemo(() => {
    if (showAllComments || sortedComments.length <= 2) {
      return sortedComments;
    }
    return sortedComments.slice(0, 2);
  }, [sortedComments, showAllComments]);

  const hasMoreComments = sortedComments.length > 2 && !showAllComments;
  return (
    <article className="rounded-2xl bg-white p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      {/* Post Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="h-12 w-12 rounded-2xl object-cover"
          />
          <div className="ml-3">
            <p className="flex items-center font-semibold text-gray-900">
              {post.authorName}
              <RoleBadge role={post.role} className="ml-3" />
            </p>
            <p className="text-sm text-gray-500">{post.createdAt}</p>
          </div>
        </div>
        <span className="ml-auto rounded-full bg-gray-100 px-4 py-1 text-xs font-semibold text-gray-500">
          {post.category}
        </span>
      </div>

      {/* Post Content */}
      <div className="mt-5">
        <h2 className="text-2xl font-semibold text-gray-900">{post.title}</h2>
        <p className="mt-3 text-gray-600">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
          <img
            src={post.imageUrl}
            alt={`Attachment from ${post.authorName}`}
            className="w-full max-h-96 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
            onClick={() => window.open(post.imageUrl, '_blank')}
            title="Click to view full size"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="mt-6 flex items-center gap-6 border-t border-gray-100 pt-4">
        <ReactionPicker
          currentReaction={post.myReactionType}
          totalReactions={post.upvotes}
          reactionBreakdown={post.reactionBreakdown || {}}
          onReactionChange={(type) => onReactionChange(post.id, type)}
        />
        <button
          type="button"
          onClick={() => onToggleCommentForm(post.id)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <FiMessageSquare className="w-5 h-5" />
          <span className="text-sm">
            {post.totalComments ?? post.comments.length} comments
          </span>
        </button>
      </div>

      {/* Comments Thread */}
      <div className="mt-6">
        {displayedComments.length > 0 && (
          <>
            <CommentThread
              comments={displayedComments}
              postId={post.id}
              replyDrafts={replyDrafts}
              activeReplyForms={activeReplyForms}
              onToggleReplyForm={onToggleReplyForm}
              onReplyDraftChange={onReplyDraftChange}
              onAddReply={onAddReply}
              onMarkBestAnswer={onMarkBestAnswer}
              onCommentReactionChange={onCommentReactionChange}
            />
            {hasMoreComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="mt-4 text-sm font-semibold text-[#EA454C] hover:text-[#d63a41] transition-colors"
              >
                View {sortedComments.length - 2} more comments
              </button>
            )}
          </>
        )}
      </div>

      {/* Comment Form (Collapsible giống Reply Form) */}
      {activeCommentForms.has(post.id) && (
        <div className="mt-6">
          <CommentForm
            postId={post.id}
            draftContent={commentDrafts[post.id]?.content ?? ''}
            draftImageFile={commentDrafts[post.id]?.imageFile ?? null}
            onContentChange={(value) => onCommentDraftChange(post.id, 'content', value)}
            onImageChange={(file) => onCommentDraftChange(post.id, 'imageFile', file)}
            onSubmit={() => onAddComment(post.id)}
            isSubmitting={commentDrafts[post.id]?.isSubmitting ?? false}
          />
        </div>
      )}
    </article>
  );
};

export default PostCard;

