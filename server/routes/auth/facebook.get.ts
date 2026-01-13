export default defineOAuthFacebookEventHandler({
  async onSuccess(event, { user }) {
    if (!user.email) {
      // Handle case where email is not provided by Facebook
      // For now redirect with error
      return sendRedirect(event, "/?error=facebook_no_email");
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (dbUser) {
      if (!dbUser.facebookId) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { facebookId: user.id },
        });
      }
    } else {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          facebookId: user.id,
          // Facebook image handling can be complex, skipping for now or using a graph URL if available
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
    console.error("Facebook OAuth error:", error);
    return sendRedirect(event, "/?error=facebook");
  },
});
