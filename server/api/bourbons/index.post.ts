import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { name, imageUrl } = body;

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name is required",
    });
  }

  try {
    const bourbon = await prisma.bourbon.create({
      data: {
        name,
        imageUrl,
        createdByUserId: session.user.id,
      },
    });

    return { bourbon };
  } catch (error) {
    console.error("Create bourbon error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create bourbon",
    });
  }
});
