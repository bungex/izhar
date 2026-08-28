import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// EDIT a post
export async function PUT(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const post = await prisma.post.update({
    where: { id: params.id },
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

  await prisma.comment.deleteMany({ where: { postId: params.id } });
  await prisma.reaction.deleteMany({ where: { postId: params.id } });
  await prisma.post.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}