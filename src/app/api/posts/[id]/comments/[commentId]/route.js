import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.comment.deleteMany({ where: { parentId: params.commentId } });
  await prisma.comment.delete({ where: { id: params.commentId } });

  return NextResponse.json({ success: true });
}