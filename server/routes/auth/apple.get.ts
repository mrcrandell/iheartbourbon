export default defineOAuthAppleEventHandler({
  async onSuccess(event, { user }) {
    if (!user.email) {
      return sendRedirect(event, "/?error=apple_no_email");
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (dbUser) {
      if (!dbUser.appleId) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { appleId: user.sub }, // Apple sub is the stable user ID
        });
      }
    } else {
      // Note: Apple only returns name object on the very first login.
      // If we miss it here, we might want to prompt user to complete profile.
      const name = user.name
        ? `${user.name.firstName} ${user.name.lastName}`
        : "Apple User";

      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: name,
          appleId: user.sub,
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
    console.error("Apple OAuth error:", error);
    return sendRedirect(event, "/?error=apple");
  },
});
