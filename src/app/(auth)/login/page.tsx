// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Chrome, ArrowRight, AlertCircle } from "lucide-react";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false}>
      <LoginForm />
    </RouteGuard>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function parseFirebaseError(code: string): string {
    const map: Record<string, string> = {
      "auth/user-not-found": "No existe una cuenta con ese correo.",
      "auth/wrong-password": "Contraseña incorrecta.",
      "auth/invalid-email": "El formato del correo no es válido.",
      "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/popup-closed-by-user": "Cerraste la ventana de Google.",
    };
    return map[code] ?? "Ocurrió un error. Intenta de nuevo.";
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(parseFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(parseFirebaseError(code));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      {/* Zona superior decorativa */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-10 pt-16">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-violet-400 mb-3">
            Bienvenido
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 leading-tight">
            Tu bitácora
            <br />
            multimedia
          </h1>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 h-12 rounded-xl",
            "bg-neutral-800 border border-neutral-700 text-neutral-100",
            "text-sm font-medium transition-all duration-150",
            "hover:bg-neutral-700 active:scale-[0.98]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {googleLoading ? (
            <span className="w-4 h-4 rounded-full border-2 border-neutral-400 border-t-transparent animate-spin" />
          ) : (
            <Chrome size={18} strokeWidth={1.5} className="text-neutral-300" />
          )}
          Continuar con Google
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-xs text-neutral-600 font-medium">o</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* Formulario email */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          {/* Campo email */}
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-xl text-sm",
                "bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600",
                "focus:outline-none focus:ring-1 focus:ring-violet-500",
                "transition-colors duration-150",
                error
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-neutral-800 focus:border-violet-500/50"
              )}
            />
          </div>

          {/* Campo contraseña */}
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
            <input
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-xl text-sm",
                "bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600",
                "focus:outline-none focus:ring-1 focus:ring-violet-500",
                "transition-colors duration-150",
                error
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-neutral-800 focus:border-violet-500/50"
              )}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs px-1">
              <AlertCircle size={14} strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {/* Olvidé mi contraseña */}
          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Olvidé mi contraseña
            </Link>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className={cn(
              "w-full h-12 rounded-xl text-sm font-medium",
              "bg-violet-600 text-white",
              "flex items-center justify-center gap-2",
              "hover:bg-violet-500 active:scale-[0.98]",
              "transition-all duration-150",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                Iniciar sesión
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        {/* Registro */}
        <p className="mt-6 text-center text-sm text-neutral-600">
          Sin cuenta?{" "}
          <Link
            href="/register"
            className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}