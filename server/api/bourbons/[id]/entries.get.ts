import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bourbon ID is required",
    });
  }

  const entries = await prisma.entry.findMany({
    where: { bourbonId: id },
    select: {
      id: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return entries;
});
