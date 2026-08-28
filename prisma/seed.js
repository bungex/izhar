/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Sarah Mitchell",
        email: "sarah@example.com",
        password: await bcrypt.hash("password123", 10),
      },
    }),
    prisma.user.create({
      data: {
        name: "James Okafor",
        email: "james@example.com",
        password: await bcrypt.hash("password123", 10),
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya@example.com",
        password: await bcrypt.hash("password123", 10),
      },
    }),
    prisma.user.create({
      data: {
        name: "Tom Brennan",
        email: "tom@example.com",
        password: await bcrypt.hash("password123", 10),
      },
    }),
    prisma.user.create({
      data: {
        name: "Lena Kovac",
        email: "lena@example.com",
        password: await bcrypt.hash("password123", 10),
      },
    }),
  ]);

  const [sarah, james, priya, tom, lena] = users;

  // Posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: "Just moved to a new city. Everything feels big and unfamiliar but I'm excited. Fresh start.",
        authorId: sarah.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Three years of grinding on this side project and it finally hit 1000 users today. Never give up.",
        authorId: james.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Finished reading Sapiens for the second time. Different book entirely when you're older.",
        authorId: priya.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Hot take: the best meetings are the ones that could have been a two-sentence message.",
        authorId: tom.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Made pasta from scratch tonight. Took two hours. Worth every minute.",
        authorId: lena.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Unpopular opinion: working from home has made me a worse collaborator and a better thinker.",
        authorId: sarah.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "If you're not journaling, you're leaving a lot of clarity on the table.",
        authorId: james.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "The gap between knowing what to do and actually doing it is where most of life happens.",
        authorId: priya.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Went for a run without headphones today. Weirdly one of the best decisions I've made this month.",
        authorId: tom.id,
      },
    }),
    prisma.post.create({
      data: {
        content: "Started learning pottery. Humbling. My hands have no idea what they're doing.",
        authorId: lena.id,
      },
    }),
  ]);

  // Comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: "Which city? That feeling fades fast, enjoy it while it lasts.",
        postId: posts[0].id,
        authorId: james.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Fresh starts are underrated. Good luck!",
        postId: posts[0].id,
        authorId: priya.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "1000 users is huge. What's the product?",
        postId: posts[1].id,
        authorId: tom.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Congrats! Three years of patience is no joke.",
        postId: posts[1].id,
        authorId: lena.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "What changed for you reading it the second time?",
        postId: posts[2].id,
        authorId: sarah.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "This. Every standup I've ever sat through.",
        postId: posts[3].id,
        authorId: james.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Homemade pasta is a different species. Good on you.",
        postId: posts[4].id,
        authorId: priya.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Running without headphones is a cheat code for thinking.",
        postId: posts[8].id,
        authorId: sarah.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: "Pottery is so therapeutic though. Stick with it.",
        postId: posts[9].id,
        authorId: tom.id,
      },
    }),
  ]);

  // Reactions
  await Promise.all([
    prisma.reaction.create({ data: { postId: posts[0].id, userId: james.id } }),
    prisma.reaction.create({ data: { postId: posts[0].id, userId: priya.id } }),
    prisma.reaction.create({ data: { postId: posts[1].id, userId: sarah.id } }),
    prisma.reaction.create({ data: { postId: posts[1].id, userId: lena.id } }),
    prisma.reaction.create({ data: { postId: posts[1].id, userId: tom.id } }),
    prisma.reaction.create({ data: { postId: posts[2].id, userId: james.id } }),
    prisma.reaction.create({ data: { postId: posts[3].id, userId: priya.id } }),
    prisma.reaction.create({ data: { postId: posts[3].id, userId: sarah.id } }),
    prisma.reaction.create({ data: { postId: posts[4].id, userId: james.id } }),
    prisma.reaction.create({ data: { postId: posts[5].id, userId: tom.id } }),
    prisma.reaction.create({ data: { postId: posts[6].id, userId: lena.id } }),
    prisma.reaction.create({ data: { postId: posts[7].id, userId: sarah.id } }),
    prisma.reaction.create({ data: { postId: posts[8].id, userId: priya.id } }),
    prisma.reaction.create({ data: { postId: posts[9].id, userId: james.id } }),
  ]);

  console.log("✓ Seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });