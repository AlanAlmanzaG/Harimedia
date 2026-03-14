// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { resetPassword } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError("No se pudo enviar el correo. Verifica la dirección.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 px-6">
      <div className="flex-1 flex flex-col justify-end pb-10 pt-16">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-10 w-fit"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Volver
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 leading-tight">
            Recuperar
            <br />
            contraseña
          </h1>
        </div>

        {sent ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-400 font-medium mb-1">
              Correo enviado
            </p>
            <p className="text-sm text-neutral-400">
              Revisa tu bandeja de entrada en{" "}
              <span className="text-neutral-200">{email}</span> y sigue las
              instrucciones.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-3">
            <p className="text-sm text-neutral-500 mb-2">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>

            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
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

            {error && (
              <p className="text-xs text-red-400 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
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
                  Enviar enlace
                  <Send size={15} strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}