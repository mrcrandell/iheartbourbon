import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group ID is required",
    });
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      groupUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      groupEntries: {
        include: {
          entry: {
            include: {
              bourbon: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
      _count: {
        select: {
          groupUsers: true,
          groupEntries: true,
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

  // Calculate average rating
  const entries = group.groupEntries.map((ge) => ge.entry);
  const avgRating = entries.length > 0
    ? entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length
    : 0;

  return {
    group: {
      ...group,
      averageRating: Math.round(avgRating * 10) / 10,
    },
  };
});
