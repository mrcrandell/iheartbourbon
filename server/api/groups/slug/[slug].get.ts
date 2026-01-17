import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required",
    });
  }

  const group = await prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          groupUsers: true,
          groupEntries: true,
        },
      },
      creator: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: "Group not found",
    });
  }

  return { group };
});
