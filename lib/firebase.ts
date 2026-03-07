// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Aquí van tus credenciales reales (asegúrate de que estén usando tus variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializamos la app asegurándonos de no hacerlo dos veces
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// ¡AQUÍ ESTÁ LA MAGIA DEL MODO OFFLINE!
// Verificamos que estamos en el navegador (window) y no en el servidor de Next.js
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        // Múltiples pestañas abiertas a la vez. El modo offline solo funciona en una pestaña.
        console.warn('Persistencia offline falló: Múltiples pestañas abiertas.');
      } else if (err.code == 'unimplemented') {
        // El navegador actual no soporta almacenamiento local (muy raro hoy en día).
        console.warn('Persistencia offline no soportada por este navegador.');
      }
    });
}

export { app, auth, db };