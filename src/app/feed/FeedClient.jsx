"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import PostCard from "@/components/PostCard";
import Navbar from "@/components/Navbar";

export default function FeedClient({ initialPosts, currentUser }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const newPost = await res.json();
    newPost.comments = [];
    newPost.reactions = [];
    setPosts([newPost, ...posts]);
    setContent("");
    setSubmitting(false);
  }

  async function handleDelete(postId) {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== postId));
  }

  async function handleEdit(postId, newContent) {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });
    const updated = await res.json();
    setPosts(posts.map((p) => (p.id === postId ? { ...p, content: updated.content } : p)));
  }

  async function handleReaction(postId) {
    const res = await fetch(`/api/posts/${postId}/reactions`, { method: "POST" });
    const { liked } = await res.json();
    setPosts(posts.map((p) => {
      if (p.id !== postId) return p;
      const reactions = liked
        ? [...p.reactions, { userId: currentUser.id }]
        : p.reactions.filter((r) => r.userId !== currentUser.id);
      return { ...p, reactions };
    }));
  }

  async function handleAddComment(postId, content, parentId = null) {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    if (!res.ok) return;
    const newComment = await res.json();
    setPosts(posts.map((p) => {
      if (p.id !== postId) return p;
      if (parentId) {
        const comments = p.comments.map((c) =>
          c.id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c
        );
        return { ...p, comments };
      }
      return { ...p, comments: [...p.comments, newComment] };
    }));
  }

  async function handleDeleteComment(postId, commentId, parentId = null) {
    await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
    setPosts(posts.map((p) => {
      if (p.id !== postId) return p;
      if (parentId) {
        const comments = p.comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
            : c
        );
        return { ...p, comments };
      }
      return { ...p, comments: p.comments.filter((c) => c.id !== commentId) };
    }));
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUser={currentUser} />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Compose */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-4">
          <div className="flex gap-3">
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #0D9488, #0369A1)" }}
            >
              {currentUser.name[0]}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full bg-transparent resize-none text-sm focus:outline-none placeholder:text-muted-foreground leading-relaxed"
              />
              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  {content.length > 0 ? `${content.length} characters` : "Share something with the team"}
                </span>
                <button
                  onClick={handleCreatePost}
                  disabled={submitting || !content.trim()}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReaction={handleReaction}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </main>
    </div>
  );
}