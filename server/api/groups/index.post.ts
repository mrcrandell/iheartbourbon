import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { name } = body;

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name is required",
    });
  }

  // Simple slugify logic for MVP
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") + "-" + Date.now().toString().slice(-4);

  try {
    const group = await prisma.group.create({
      data: {
        name,
        slug,
        creatorId: session.user.id,
        groupUsers: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    });

    return { group };
  } catch (error) {
    console.error("Group creation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create group",
    });
  }
});
