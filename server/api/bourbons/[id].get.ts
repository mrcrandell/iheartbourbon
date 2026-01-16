import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bourbon ID is required",
    });
  }

  try {
    const bourbon = await prisma.bourbon.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!bourbon) {
      throw createError({
        statusCode: 404,
        statusMessage: "Bourbon not found",
      });
    }

    return { bourbon };
  } catch (error) {
    console.error("Get bourbon error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch bourbon",
    });
  }
});
