import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '',
};

// Validação das credenciais
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key' || firebaseConfig.apiKey === '') {
    console.error('❌ Firebase API Key não configurada. Verifique o ficheiro .env.local');
    console.error('API Key atual:', firebaseConfig.apiKey || 'VAZIO');
  } else {
    console.log('✅ Firebase API Key carregada:', firebaseConfig.apiKey.substring(0, 20) + '...');
  }
  if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your-project-id' || firebaseConfig.projectId === '') {
    console.error('❌ Firebase Project ID não configurado. Verifique o ficheiro .env.local');
  } else {
    console.log('✅ Firebase Project ID:', firebaseConfig.projectId);
  }
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

