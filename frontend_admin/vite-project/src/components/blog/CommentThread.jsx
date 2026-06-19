import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import RoleBadge from './RoleBadge';
import CommentForm from './CommentForm';
import ReactionPicker from './ReactionPicker';

/**
 * Component render cây comment đệ quy
 * 
 * @param {Array} comments - Mảng comments (có thể có replies)
 * @param {number|string} postId - ID của post
 * @param {number} depth - Độ sâu của comment (0 = root)
 * @param {Object} replyDrafts - State drafts cho các reply
 * @param {Set} activeReplyForms - Set các commentId đang mở reply form
 * @param {Function} onToggleReplyForm - Callback toggle reply form
 * @param {Function} onReplyDraftChange - Callback khi reply draft thay đổi
 * @param {Function} onAddReply - Callback khi submit reply
 * @param {Function} onMarkBestAnswer - Callback khi mark best answer
 * @param {Function} onCommentReactionChange - Callback khi reaction comment thay đổi
 */
const CommentThread = ({
  comments,
  postId,
  depth = 0,
  replyDrafts = {},
  activeReplyForms = new Set(),
  onToggleReplyForm,
  onReplyDraftChange,
  onAddReply,
  onMarkBestAnswer,
  onCommentReactionChange,
}) => {
  if (!comments || comments.length === 0) return null;

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`rounded-2xl border p-4 ${
            comment.isBestAnswer
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-100 bg-gray-50'
          } ${depth > 0 ? 'ml-6 md:ml-10' : ''}`}
        >
          {/* Comment Header */}
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-800">
            {/* Avatar */}
            <img 
              src={comment.authorAvatar} 
              alt={comment.authorName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{comment.authorName}</span>
            <RoleBadge role={comment.role} />
            <span className="text-xs font-normal text-gray-400">{comment.createdAt}</span>
            {comment.isBestAnswer && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
                <FiCheckCircle className="mr-1" /> Best answer
              </span>
            )}
          </div>

          {/* Comment Content */}
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{comment.content}</p>
          {comment.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <img
                src={comment.imageUrl}
                alt={`Attachment from ${comment.authorName}`}
                className="w-full max-h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => window.open(comment.imageUrl, '_blank')}
                title="Click to view full size"
              />
            </div>
          )}

          {/* Comment Actions Bar (Like + Reply) */}
          <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-2">
            {onCommentReactionChange && (
              <ReactionPicker
                currentReaction={comment.myReactionType || null}
                totalReactions={comment.reactionsCount || 0}
                reactionBreakdown={comment.reactionBreakdown || {}}
                onReactionChange={(type) => onCommentReactionChange(comment.id, type)}
              />
            )}
            <button
              type="button"
              onClick={() => {
                onToggleReplyForm(comment.id);
                // Focus vào reply form khi click Reply
                setTimeout(() => {
                  const replyForm = document.querySelector(`[data-comment-id="${comment.id}"] textarea`);
                  if (replyForm) {
                    replyForm.focus();
                  }
                }, 100);
              }}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Reply
            </button>
            {!comment.isBestAnswer && (
              <button
                onClick={() => onMarkBestAnswer(postId, comment.id)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <FiCheckCircle className="inline mr-1" /> Mark as best answer
              </button>
            )}
          </div>

          {/* Reply Form (Collapsible giống Facebook) */}
          {activeReplyForms.has(comment.id) && (
            <div data-comment-id={comment.id} className="mt-2">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                replyingToName={comment.authorName}
                draftContent={replyDrafts[comment.id]?.content ?? ''}
                draftImageFile={replyDrafts[comment.id]?.imageFile ?? null}
                onContentChange={(value) => onReplyDraftChange(comment.id, value, undefined)}
                onImageChange={(file) => onReplyDraftChange(comment.id, undefined, file)}
                onSubmit={() => onAddReply(postId, comment.id, comment.authorName)}
                isSubmitting={replyDrafts[comment.id]?.isSubmitting ?? false}
                placeholder={`Reply to ${comment.authorName}...`}
              />
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
              <CommentThread
                comments={comment.replies}
                postId={postId}
                depth={depth + 1}
                replyDrafts={replyDrafts}
                activeReplyForms={activeReplyForms}
                onToggleReplyForm={onToggleReplyForm}
                onReplyDraftChange={onReplyDraftChange}
                onAddReply={onAddReply}
                onMarkBestAnswer={onMarkBestAnswer}
                onCommentReactionChange={onCommentReactionChange}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentThread;

