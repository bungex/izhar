"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import PostCard from "@/components/PostCard";

export default function FeedClient({ initialPosts, currentUser }) {
  const [posts, setPosts] = useState(initialPosts);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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

    if (!res.ok) {
        console.error("Failed to add comment", await res.text());
        return;
    }
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
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">Izhar</span>
          <div className="flex items-center gap-4">
            <Link href={`/profile/${currentUser.id}`} className="text-sm text-muted-foreground hover:text-foreground transition">
              {currentUser.name}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Compose */}
        <div className="rounded-xl border border-border bg-card p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent resize-none text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCreatePost}
              disabled={submitting || !content.trim()}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
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