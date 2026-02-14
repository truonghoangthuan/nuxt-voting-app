import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
    logout,
  };
};
