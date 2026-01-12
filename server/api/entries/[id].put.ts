import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { isThumbsUp, rating, comment, groupIds } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Entry ID is required",
    });
  }

  const existingEntry = await prisma.entry.findUnique({
    where: { id },
    include: { groups: true },
  });

  if (!existingEntry) {
    throw createError({
      statusCode: 404,
      statusMessage: "Entry not found",
    });
  }

  if (existingEntry.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not authorized to update this entry",
    });
  }

  // Handle group updates if provided
  let groupUpdateOp = undefined;
  if (groupIds && Array.isArray(groupIds)) {
    // Verify membership for new groups
    const memberships = await prisma.groupMember.findMany({
      where: {
        userId: session.user.id,
        groupId: { in: groupIds },
      },
      select: { groupId: true },
    });
    const validGroupIds = memberships.map((m) => m.groupId);
    groupUpdateOp = { set: validGroupIds.map((id) => ({ id })) };
  }

  try {
    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        isThumbsUp: isThumbsUp !== undefined ? !!isThumbsUp : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        comment: comment !== undefined ? comment : undefined,
        groups: groupUpdateOp,
      },
      include: {
        groups: true,
        bourbon: true,
      },
    });

    return { entry: updatedEntry };
  } catch (error) {
    console.error("Update entry error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update entry",
    });
  }
});
