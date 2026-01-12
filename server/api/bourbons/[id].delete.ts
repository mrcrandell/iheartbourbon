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

  const existingBourbon = await prisma.bourbon.findUnique({
    where: { id },
  });

  if (!existingBourbon) {
    throw createError({
      statusCode: 404,
      statusMessage: "Bourbon not found",
    });
  }

  if (existingBourbon.createdByUserId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not authorized to delete this bourbon",
    });
  }

  try {
    await prisma.bourbon.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete bourbon error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete bourbon",
    });
  }
});
