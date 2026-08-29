import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
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
          comments: {
            where: { parentId: null },
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, name: true } },
              replies: {
                orderBy: { createdAt: "asc" },
                include: {
                  author: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  return <ProfileClient user={user} currentUser={session.user} />;
}