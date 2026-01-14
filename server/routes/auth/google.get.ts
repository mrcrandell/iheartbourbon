export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (dbUser) {
      // Update googleId and avatar if missing
      const updates: { googleId?: string; avatarUrl?: string } = {};

      if (!dbUser.googleId) {
        updates.googleId = user.sub;
      }
      if (!dbUser.avatarUrl) {
        updates.avatarUrl = user.picture;
      }

      if (Object.keys(updates).length > 0) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: updates,
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
