import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { name, email } = body;

  if (!name || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name and email are required",
    });
  }

  // Check if email is already in use by another user
  if (email !== session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email is already in use",
      });
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
    });

    // Update session
    await setUserSession(event, {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    };
  } catch (error) {
    console.error("Update profile error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update profile",
    });
  }
});
