import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const memberships = await prisma.groupMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      group: {
        include: {
          _count: {
            select: { members: true },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return memberships.map((m: any) => ({
    ...m.group,
    role: m.role, // Include their role in that group
    memberCount: m.group._count.members,
  }));
});
