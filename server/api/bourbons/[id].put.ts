import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { name, imageUrl } = body;

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
      statusMessage: "You are not authorized to update this bourbon",
    });
  }

  try {
    const updatedBourbon = await prisma.bourbon.update({
      where: { id },
      data: {
        name,
        imageUrl,
      },
    });

    return { bourbon: updatedBourbon };
  } catch (error) {
    console.error("Update bourbon error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update bourbon",
    });
  }
});
