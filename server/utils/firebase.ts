import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const config = useRuntimeConfig();

const firebaseConfig = {
  projectId: config.firebase.projectId,
  clientEmail: config.firebase.clientEmail,
  privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
};

if (getApps().length === 0) {
  initializeApp({
    credential: cert(firebaseConfig),
  });
}

export const firestore = getFirestore();
