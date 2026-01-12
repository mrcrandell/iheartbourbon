import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { slug } = body;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group code is required",
    });
  }

  const group = await prisma.group.findUnique({
    where: { slug },
  });

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: "Group not found",
    });
  }

  // Check if already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    return {
      message: "Already a member",
      group,
    };
  }

  try {
    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "MEMBER",
      },
    });

    return { group };
  } catch (error) {
    console.error("Join group error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to join group",
    });
  }
});
