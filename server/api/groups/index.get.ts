import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const memberships = await prisma.groupUser.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      group: {
        include: {
          _count: {
            select: { groupUsers: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return memberships.map((m: any) => ({
    ...m.group,
    role: m.role, // Include their role in that group
    memberCount: m.group._count.groupUsers,
  }));
});
