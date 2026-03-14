// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, AlertCircle, Check } from "lucide-react";
import { registerWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <RouteGuard requireAuth={false}>
      <RegisterForm />
    </RouteGuard>
  );
}

// ─── Validación de contraseña ─────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "8 caracteres mínimo", test: (p: string) => p.length >= 8 },
  { label: "Una letra mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un número", test: (p: string) => /[0-9]/.test(p) },
];

function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));

  function parseFirebaseError(code: string): string {
    const map: Record<string, string> = {
      "auth/email-already-in-use": "Este correo ya tiene una cuenta registrada.",
      "auth/invalid-email": "El formato del correo no es válido.",
      "auth/weak-password": "La contraseña es demasiado débil.",
      "auth/popup-closed-by-user": "Cerraste la ventana de Google.",
    };
    return map[code] ?? "Ocurrió un error. Intenta de nuevo.";
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValid) {
      setError("La contraseña no cumple los requisitos.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName.trim());
      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(parseFirebaseError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
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
      <div className="flex-1 flex flex-col justify-end px-6 pb-10 pt-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-violet-400 mb-3">
            Nuevo registro
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 leading-tight">
            Crea tu
            <br />
            bitácora
          </h1>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleRegister}
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
            // Chrome icon inline — Lucide Chrome
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-300"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" y1="8" x2="12" y2="8" />
              <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
              <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
            </svg>
          )}
          Registrarse con Google
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-xs text-neutral-600 font-medium">o</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          {/* Nombre */}
          <div className="relative">
            <User
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={40}
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-xl text-sm",
                "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
                "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
                "transition-colors duration-150"
              )}
            />
          </div>

          {/* Email */}
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
                "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
                "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
                "transition-colors duration-150"
              )}
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
            <input
              type="password"
              placeholder="Contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowRules(true)}
              required
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-xl text-sm",
                "bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600",
                "focus:outline-none focus:ring-1",
                "transition-colors duration-150",
                password.length > 0 && !passwordValid
                  ? "border-amber-500/50 focus:ring-amber-500/50"
                  : password.length > 0 && passwordValid
                  ? "border-emerald-500/50 focus:ring-emerald-500/50"
                  : "border-neutral-800 focus:ring-violet-500 focus:border-violet-500/50"
              )}
            />
          </div>

          {/* Reglas de contraseña */}
          {showRules && password.length > 0 && (
            <ul className="flex flex-col gap-1.5 px-1">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors duration-150",
                      ok ? "text-emerald-400" : "text-neutral-600"
                    )}
                  >
                    <Check
                      size={12}
                      strokeWidth={2.5}
                      className={ok ? "opacity-100" : "opacity-30"}
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Error global */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs px-1">
              <AlertCircle size={14} strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className={cn(
              "w-full h-12 rounded-xl text-sm font-medium mt-1",
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
                Crear cuenta
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        {/* Ya tengo cuenta */}
        <p className="mt-6 text-center text-sm text-neutral-600">
          Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}