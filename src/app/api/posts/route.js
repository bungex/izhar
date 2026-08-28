import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all posts
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      reactions: true,
      comments: {
        include: {
          author: { select: { id: true, name: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true } },
            },
          },
        },
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(posts);
}

// CREATE a post
export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const post = await prisma.post.create({
    data: { content, authorId: session.user.id },
    include: {
      author: { select: { id: true, name: true } },
      reactions: true,
      comments: true,
    },
  });

  return NextResponse.json(post);
}