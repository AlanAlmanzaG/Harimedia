// src/hooks/useAuth.ts
"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/authStore";

/**
 * Suscribe el store de Zustand al estado de autenticación de Firebase.
 * Debe montarse una sola vez en el Provider raíz.
 */
export function useAuthListener() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, [setUser]);
}

/**
 * Hook de consumo — devuelve el usuario y el estado de carga.
 */
export function useAuth() {
  const { user, loading } = useAuthStore();
  return { user, loading, isAuthenticated: !!user };
}