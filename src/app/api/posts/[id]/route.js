import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// EDIT a post
export async function PUT(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  const { id } = await params;
  if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const post = await prisma.post.update({
    where: { id: id },
    data: { content },
    include: {
      author: { select: { id: true, name: true } },
      reactions: true,
      comments: true,
    },
  });

  return NextResponse.json(post);
}

// DELETE a post
export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.comment.deleteMany({ where: { postId: id } });
  await prisma.reaction.deleteMany({ where: { postId: id } });
  await prisma.post.delete({ where: { id: id } });

  return NextResponse.json({ success: true });
}