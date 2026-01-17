import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import { registrationValidation } from "../../../shared/utils/validation";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validate body with Joi
  const { error, value } = registrationValidation.validate(body);
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  const { email, password, name } = value;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Automatically log the user in
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to register user",
    });
  }
});
