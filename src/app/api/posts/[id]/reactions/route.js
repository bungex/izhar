import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// TOGGLE like
export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;

  const existing = await prisma.reaction.findUnique({
    where: {
      postId_userId: {
        postId: id,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.reaction.create({
      data: { postId: id, userId: session.user.id },
    });
    return NextResponse.json({ liked: true });
  }
}