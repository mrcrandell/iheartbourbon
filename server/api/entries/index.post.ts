import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { bourbonId, isThumbsUp, rating, comment, groupIds } = body;

  if (!bourbonId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bourbon is required",
    });
  }

  // Verify group memberships if groupIds are provided
  let validGroupIds: string[] = [];
  if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
    const memberships = await prisma.groupMember.findMany({
      where: {
        userId: session.user.id,
        groupId: { in: groupIds },
      },
      select: { groupId: true },
    });
    validGroupIds = memberships.map((m) => m.groupId);
  }

  try {
    const entry = await prisma.entry.create({
      data: {
        userId: session.user.id,
        bourbonId,
        isThumbsUp: !!isThumbsUp,
        rating: Number(rating) || 0,
        comment: comment || "",
        groups: {
          connect: validGroupIds.map((id) => ({ id })),
        },
      },
      include: {
        bourbon: true,
        groups: true,
      },
    });

    return { entry };
  } catch (error) {
    console.error("Create entry error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create entry",
    });
  }
});
