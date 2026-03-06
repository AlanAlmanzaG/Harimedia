// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Escuchamos los cambios de estado en Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Logica de proteccion de rutas:
      // Si no hay usuario y no esta en la pagina de login, lo mandamos al login
      if (!currentUser && pathname !== '/login') {
        router.push('/login');
      } 
      // Si hay usuario y esta en la pagina de login, lo mandamos al inicio
      else if (currentUser && pathname === '/login') {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Mientras Firebase decide si hay usuario o no, mostramos una pantalla en blanco o un loader */}
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}