export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    // Redirect unauthenticated users to home
    return navigateTo("/");
  }
});
