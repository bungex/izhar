import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// CREATE a comment or reply
export async function POST(req, { params }) {
  try {
      const session = await auth();
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { id } = await params;
      const body = await req.json();
      const { content, parentId } = body;

      if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 });

      const comment = await prisma.comment.create({
        data: {
          content,
          postId: id,
          authorId: session.user.id,
          parentId: parentId || null,
        },
        include: {
          author: { select: { id: true, name: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true } },
            },
          },
        },
      });

      return NextResponse.json(comment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

}