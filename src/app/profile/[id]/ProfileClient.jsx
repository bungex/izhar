"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfileClient({ user, currentUser }) {
  const [posts, setPosts] = useState(user.posts);
  const router = useRouter();

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
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/feed" className="font-bold text-lg tracking-tight">
            Izhar
          </Link>
          <Link
            href={`/profile/${currentUser.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            {currentUser.name}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Profile header */}
        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Joined {formatDate(user.createdAt)} · {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No posts yet.</p>
        ) : (
          posts.map((post) => (
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
          ))
        )}
      </main>
    </div>
  );
}