export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    // Redirect unauthenticated users to home with redirect query param
    return navigateTo({
      path: "/",
      query: { redirect: to.fullPath },
    });
  }
});
