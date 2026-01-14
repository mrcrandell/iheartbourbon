export default defineOAuthFacebookEventHandler({
  config: {
    scope: ["email", "public_profile"],
    fields: ["id", "name", "email", "picture"],
  },
  async onSuccess(event, { user, tokens }) {
    if (!user.email) {
      if (tokens.access_token) {
        try {
          const fetchResult: any = await $fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.access_token}`,
          );
          if (fetchResult && fetchResult.email) {
            user.email = fetchResult.email;
            // user.picture might be in a different structure from manual fetch (user.picture.data.url)
            // vs the one from the library. We mainly care about email here.
          }
        } catch (e) {
          console.error("Failed to manually fetch Facebook user:", e);
        }
      }
    }

    if (!user.email) {
      console.log("Facebook User Object (No Email):", user);
      // Handle case where email is not provided by Facebook
      // For now redirect with error
      return sendRedirect(event, "/?error=facebook_no_email");
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (dbUser) {
      const updates: { facebookId?: string; avatarUrl?: string } = {};

      if (!dbUser.facebookId) {
        updates.facebookId = user.id;
      }
      if (!dbUser.avatarUrl) {
        updates.avatarUrl =
          `https://graph.facebook.com/${user.id}/picture?type=large`;
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
          facebookId: user.id,
          avatarUrl: `https://graph.facebook.com/${user.id}/picture?type=large`,
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
