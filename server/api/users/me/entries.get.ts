import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const entries = await prisma.entry.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      bourbon: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      groupEntries: {
        include: {
          group: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    entries: entries.map((entry) => ({
      ...entry,
      groups: entry.groupEntries.map((ge) => ge.group),
    })),
  };
});
