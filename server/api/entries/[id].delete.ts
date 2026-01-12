import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Entry ID is required",
    });
  }

  const existingEntry = await prisma.entry.findUnique({
    where: { id },
  });

  if (!existingEntry) {
    throw createError({
      statusCode: 404,
      statusMessage: "Entry not found",
    });
  }

  if (existingEntry.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not authorized to delete this entry",
    });
  }

  try {
    await prisma.entry.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete entry error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete entry",
    });
  }
});
