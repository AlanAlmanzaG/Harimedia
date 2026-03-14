// src/components/layout/RouteGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const router = useRouter();
  // null = aún no sabemos, true/false = Firebase respondió
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Suscribirse directamente a Firebase aquí garantiza que
    // el guard tiene su propio listener y no depende del timing del store.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user ? "authenticated" : "unauthenticated");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authState === "loading") return;

    if (requireAuth && authState === "unauthenticated") {
      router.replace("/login");
    } else if (!requireAuth && authState === "authenticated") {
      router.replace("/");
    }
  }, [authState, requireAuth, router]);

  // Bloquear render hasta que Firebase responda
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <span className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Evitar flash de contenido protegido antes de redirigir
  if (requireAuth && authState === "unauthenticated") return null;
  if (!requireAuth && authState === "authenticated") return null;

  return <>{children}</>;
}