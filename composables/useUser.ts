export const useUser = () => {
  const { user } = useAuth();

  const userName = computed(() => {
    if (user.value?.displayName) {
      return user.value.displayName;
    }
    if (user.value?.email) {
      return user.value.email.split('@')[0];
    }
    return 'Guest';
  });

  // Deprecated/No-op functions for compatibility during refactor
  const init = () => {};
  const setUserName = (name: string) => {};

  return {
    userName,
    init,
    setUserName,
  };
};
