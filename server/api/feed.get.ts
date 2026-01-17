import { prisma } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  // 1. Get groups the user is in
  const userGroups = await prisma.groupUser.findMany({
    where: { userId },
    select: { groupId: true },
  });
  const groupIds = userGroups.map((ug) => ug.groupId);

  // 2. Get entries from these groups, excluding own entries
  const feed = await prisma.entry.findMany({
    where: {
      userId: { not: userId }, // Exclude own
      groupEntries: {
        some: {
          groupId: { in: groupIds },
        },
      },
    },
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
      groupEntries: {
        where: {
          groupId: { in: groupIds },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    feed: feed.map((entry) => ({
      ...entry,
      groups: entry.groupEntries.map((ge) => ge.group),
    })),
  };
});
