export const useUser = () => {
  const USER_STORAGE_KEY = 'user_name';
  const userName = useState<string | null>('user_name', () => null);

  const init = () => {
    if (import.meta.server) return;
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      userName.value = stored;
    }
  };

  const setUserName = (name: string) => {
    if (import.meta.server) return;
    localStorage.setItem(USER_STORAGE_KEY, name);
    userName.value = name;
  };

  return {
    userName,
    init,
    setUserName,
  };
};
