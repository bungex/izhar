import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          reactions: true,
          comments: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}