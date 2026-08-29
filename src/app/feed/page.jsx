import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
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
  });

  return <FeedClient initialPosts={posts} currentUser={session.user} />;
}