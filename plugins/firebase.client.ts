import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: config.public.firebase.apiKey,
    authDomain: config.public.firebase.authDomain,
    projectId: config.public.firebase.projectId,
    storageBucket: config.public.firebase.storageBucket,
    messagingSenderId: config.public.firebase.messagingSenderId,
    appId: config.public.firebase.appId,
  };

  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  const auth = getAuth();

  return {
    provide: {
      auth,
    },
  };
});
