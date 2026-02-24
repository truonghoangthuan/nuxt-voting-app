import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  type User,
} from 'firebase/auth';

export const useAuth = () => {
  const user = useState<User | null>('user', () => null);
  const loading = useState<boolean>('auth-loading', () => true);
  const error = useState<string | null>('auth-error', () => null);

  const { $auth } = useNuxtApp();

  // Initialize auth state listener
  onMounted(() => {
    if (!$auth) {
      console.warn('Firebase Auth is not initialized. Please checking plugins/firebase.client.ts');
      return;
    }
    onAuthStateChanged($auth as any, (currentUser) => {
      user.value = currentUser;
      loading.value = false;
    });
  });

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      await signInWithEmailAndPassword($auth as any, email, password);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      await createUserWithEmailAndPassword($auth as any, email, password);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const loginAsGuest = async (username?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const userCredential = await signInAnonymously($auth as any);
      if (username) {
        await updateProfile(userCredential.user, {
          displayName: username,
        });
        // Force update the reactive user state to reflect the new displayName
        user.value = { ...userCredential.user, displayName: username } as User;
      } else {
        user.value = userCredential.user as User;
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateGuestUsername = async (username: string) => {
    if (user.value) {
      loading.value = true;
      try {
        await updateProfile(user.value, { displayName: username });
        user.value = { ...user.value, displayName: username } as User;
      } finally {
        loading.value = false;
      }
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;
    try {
      await signOut($auth as any);
      user.value = null;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    loginAsGuest,
    updateGuestUsername,
    logout,
  };
};
