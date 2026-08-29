"use client";

import { useState } from "react";
import Link from "next/link";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Comment({ comment, currentUser, postId, onDeleteComment, onAddComment, parentId = null }) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  async function submitReply() {
    if (!replyContent.trim()) return;
    await onAddComment(postId, replyContent, comment.id);
    setReplyContent("");
    setReplying(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm">
          <Link href={`/profile/${comment.author.id}`} className="font-medium hover:underline">
            {comment.author.name}
          </Link>
          <p className="text-foreground mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          {!parentId && (
            <button onClick={() => setReplying(!replying)} className="text-xs text-muted-foreground hover:text-foreground">
              Reply
            </button>
          )}
          <button
            onClick={() => onDeleteComment(postId, comment.id, parentId)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-6 flex flex-col gap-1 mt-1">
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

      {/* Reply input */}
      {replying && (
        <div className="ml-6 flex gap-2 mt-1">
          <input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={submitReply}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
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

  const liked = post.reactions.some((r) => r.userId === currentUser.id);

  async function handleEdit() {
    await onEdit(post.id, editContent);
    setEditing(false);
  }

  async function handleComment() {
    if (!commentContent.trim()) return;
    await onAddComment(post.id, commentContent);
    setCommentContent("");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {post.author.name[0]}
          </div>
          <div>
            <Link href={`/profile/${post.author.id}`} className="text-sm font-medium hover:underline">
              {post.author.name}
            </Link>
            <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-xs text-muted-foreground hover:text-foreground">
            Edit
          </button>
          <button onClick={() => onDelete(post.id)} className="text-xs text-muted-foreground hover:text-destructive">
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted">
              Cancel
            </button>
            <button onClick={handleEdit} className="text-sm px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed">{post.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => onReaction(post.id)}
          className={`flex items-center gap-1.5 text-sm transition ${liked ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          <span>{liked ? "♥" : "♡"}</span>
          <span>{post.reactions.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          💬 {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="flex flex-col gap-3 pt-1 border-t border-border">
          <div className="flex flex-col gap-2 mt-2">
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
          <div className="flex gap-2">
            <input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleComment}
              className="text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}