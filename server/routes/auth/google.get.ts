export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (dbUser) {
      // Update googleId and avatar if missing or changed
      if (!dbUser.googleId || !dbUser.avatarUrl) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { googleId: user.sub, avatarUrl: user.picture },
        });
      }
    } else {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          googleId: user.sub,
          avatarUrl: user.picture,
        },
      });
    }

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
      },
    });
    return sendRedirect(event, "/");
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/?error=google");
  },
});
