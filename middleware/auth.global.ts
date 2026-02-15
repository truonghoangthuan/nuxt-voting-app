export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user } = useAuth();

  const publicRoutes = ['/login', '/register'];

  if (publicRoutes.includes(to.path)) {
    // If user is logged in, redirect to home
    if (user.value) {
      return navigateTo('/');
    }
    return;
  }

  // If user is not logged in
  if (!user.value) {
    return navigateTo('/login');
  }
});
