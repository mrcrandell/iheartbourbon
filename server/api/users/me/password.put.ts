import { prisma } from "../../../utils/prisma";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "All password fields are required",
    });
  }

  if (newPassword !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "New passwords do not match",
    });
  }

  if (newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 8 characters",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Unable to change password",
      });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Change password error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change password",
    });
  }
});
