"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ name, size = "sm" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  return (
    <div
      className={`${sizes[size]} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white`}
      style={{ background: "linear-gradient(135deg, #0D9488, #0369A1)" }}
    >
      {name[0]}
    </div>
  );
}

function Comment({ comment, currentUser, postId, onDeleteComment, onAddComment, parentId = null }) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await onAddComment(postId, replyContent, comment.id);
    setReplyContent("");
    setReplying(false);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <Avatar name={comment.author.name} size="sm" />
        <div className="flex-1">
          <div className="bg-muted rounded-xl px-3 py-2 text-sm">
            <Link href={`/profile/${comment.author.id}`} className="font-semibold text-foreground hover:text-primary transition text-xs">
              {comment.author.name}
            </Link>
            <p className="text-foreground mt-0.5 leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>{timeAgo(comment.createdAt)}</span>
            {!parentId && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-muted-foreground hover:text-primary font-medium transition cursor-pointer"
              >
                Reply
              </button>
            )}
            <button
              onClick={() => onDeleteComment(postId, comment.id, parentId)}
              className="text-xs text-muted-foreground hover:text-destructive transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="ml-9 flex flex-col gap-1.5">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              postId={postId}
              onDeleteComment={onDeleteComment}
              onAddComment={onAddComment}
              parentId={comment.id}
            />
          ))}
        </div>
      )}

      {replying && (
        <div className="ml-9 flex gap-2 mt-1">
          <input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitReply()}
            placeholder="Write a reply..."
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          <button
            onClick={submitReply}
            disabled={submitting}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" 
          >
            Reply
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostCard({ post, currentUser, onDelete, onEdit, onReaction, onAddComment, onDeleteComment }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const liked = post.reactions.some((r) => r.userId === currentUser.id);

  async function handleEdit() {
    await onEdit(post.id, editContent);
    setEditing(false);
  }

  async function handleComment() {
    if (!commentContent.trim()) return;
    setSubmitting(true);
    await onAddComment(post.id, commentContent);
    setCommentContent("");
    setSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 flex flex-col gap-3 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.author.name} size="md" />
          <div>
            <Link href={`/profile/${post.author.id}`} className="text-sm font-semibold hover:text-primary transition">
              {post.author.name}
            </Link>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-1 cursor-pointer">
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-xs px-2.5 py-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{post.content}</p>
      )}

      <div className="flex items-center gap-1 pt-1 border-t border-border">
        <button
          onClick={() => onReaction(post.id)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
            liked ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Heart size={15}   style={{ fill: liked ? "#F43F5E" : "none", color: liked ? "#F43F5E" : "currentColor" }} />
          {/* <span>{liked ? "♥" : "♡"}</span> */}
          <span>{post.reactions.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition cursor-pointer ${
            showComments ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <MessageCircle size={15} />
          {/* <span>💬</span> */}
          <span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
        </button>
      </div>

      {showComments && (
        <div className="flex flex-col gap-3">
          {post.comments.length > 0 && (
            <div className="flex flex-col gap-3">
              {post.comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  postId={post.id}
                  onDeleteComment={onDeleteComment}
                  onAddComment={onAddComment}
                />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            <button
              onClick={handleComment}
              disabled={submitting || !commentContent.trim()}
              className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}