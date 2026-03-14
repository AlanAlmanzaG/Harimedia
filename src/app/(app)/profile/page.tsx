// src/app/(app)/profile/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogOut,
  UserCircle,
  Mail,
  Shield,
  Bell,
  Moon,
  ChevronRight,
  Camera,
  Check,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { logout } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [section, setSection] = useState<
    "main" | "edit-name" | "change-password"
  >("main");

  async function handleLogout() {
    await logout();
    setUser(null);
    router.replace("/login");
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-8">
      {section === "main" && (
        <MainProfile
          user={user}
          onEditName={() => setSection("edit-name")}
          onChangePassword={() => setSection("change-password")}
          onLogout={handleLogout}
        />
      )}
      {section === "edit-name" && (
        <EditNameSection
          currentName={user.displayName ?? ""}
          onBack={() => setSection("main")}
        />
      )}
      {section === "change-password" && (
        <ChangePasswordSection onBack={() => setSection("main")} />
      )}
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

function MainProfile({
  user,
  onEditName,
  onChangePassword,
  onLogout,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onEditName: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isGoogleUser = user.providerData.some(
    (p) => p.providerId === "google.com"
  );

  const initials = (user.displayName ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* ── Avatar y nombre ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 pt-2 pb-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-violet-600/20 border-2 border-violet-500/30 flex items-center justify-center">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? "Avatar"}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <span className="text-2xl font-bold text-violet-400">
                {initials}
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-lg font-semibold text-neutral-100">
            {user.displayName ?? "Sin nombre"}
          </h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>

        {isGoogleUser && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
            <Shield size={11} strokeWidth={1.5} />
            Cuenta de Google
          </span>
        )}
      </div>

      {/* ── Sección: Cuenta ─────────────────────────────────────── */}
      <SettingsSection title="Cuenta">
        <SettingsRow
          icon={UserCircle}
          label="Nombre de perfil"
          value={user.displayName ?? "—"}
          onPress={onEditName}
        />
        <SettingsRow
          icon={Mail}
          label="Correo electrónico"
          value={user.email ?? "—"}
        />
        {!isGoogleUser && (
          <SettingsRow
            icon={Shield}
            label="Cambiar contraseña"
            onPress={onChangePassword}
          />
        )}
      </SettingsSection>

      {/* ── Sección: Preferencias ───────────────────────────────── */}
      <SettingsSection title="Preferencias">
        <SettingsRow
          icon={Moon}
          label="Tema"
          value="Oscuro"
        />
        <SettingsRow
          icon={Bell}
          label="Notificaciones"
          value="Próximamente"
          disabled
        />
      </SettingsSection>

      {/* ── Sección: Información ────────────────────────────────── */}
      <SettingsSection title="Información">
        <SettingsRow
          icon={ExternalLink}
          label="Versión"
          value="1.0.0"
        />
      </SettingsSection>

      {/* ── Cerrar sesión ───────────────────────────────────────── */}
      <div className="mt-2">
        {!showLogoutConfirm ? (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-red-500/25 bg-red-500/8 text-sm font-medium text-red-400 hover:bg-red-500/15 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        ) : (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col gap-3">
            <p className="text-sm text-neutral-300 text-center">
              Cerrar sesión en este dispositivo?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 h-10 rounded-xl bg-red-600 text-sm text-white font-medium hover:bg-red-500 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Editar nombre ────────────────────────────────────────────────────────────

function EditNameSection({
  currentName,
  onBack,
}: {
  currentName: string;
  onBack: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim() || name === currentName) return;
    setSaving(true);
    setError(null);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
        });
      }
      setSaved(true);
      setTimeout(onBack, 800);
    } catch {
      setError("No se pudo actualizar el nombre.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-4"
        >
          Volver
        </button>
        <h2 className="text-lg font-semibold text-neutral-100">
          Nombre de perfil
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Este nombre aparece en tu bitácora.
        </p>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        className={cn(
          "w-full h-12 px-4 rounded-2xl text-sm",
          "bg-neutral-900 border border-neutral-800 text-neutral-100",
          "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
          "transition-colors"
        )}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !name.trim() || name === currentName}
        className={cn(
          "w-full h-12 rounded-2xl text-sm font-medium",
          "flex items-center justify-center gap-2",
          "transition-all duration-150",
          saved
            ? "bg-emerald-600 text-white"
            : "bg-violet-600 text-white hover:bg-violet-500",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {saving ? (
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={16} strokeWidth={2} />
            Guardado
          </>
        ) : (
          "Guardar nombre"
        )}
      </button>
    </div>
  );
}

// ─── Cambiar contraseña ───────────────────────────────────────────────────────

function ChangePasswordSection({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = next.length > 0 && confirm.length > 0 && next !== confirm;
  const weak = next.length > 0 && next.length < 8;

  async function handleChange() {
    if (!auth.currentUser?.email) return;
    if (next !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (next.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        current
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, next);
      setSaved(true);
      setTimeout(onBack, 1000);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("La contraseña actual es incorrecta.");
      } else {
        setError("No se pudo cambiar la contraseña.");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls = cn(
    "w-full h-12 px-4 rounded-2xl text-sm",
    "bg-neutral-900 border border-neutral-800 text-neutral-100",
    "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
    "transition-colors"
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-4"
        >
          Volver
        </button>
        <h2 className="text-lg font-semibold text-neutral-100">
          Cambiar contraseña
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-500">
            Contraseña actual
          </label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-500">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className={cn(
              inputCls,
              weak && "border-amber-500/50 focus:ring-amber-500/50"
            )}
          />
          {weak && (
            <p className="text-[11px] text-amber-400">
              Mínimo 8 caracteres
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-500">
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className={cn(
              inputCls,
              mismatch && "border-red-500/50 focus:ring-red-500/50"
            )}
          />
          {mismatch && (
            <p className="text-[11px] text-red-400">
              Las contraseñas no coinciden
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertTriangle size={13} strokeWidth={1.5} />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleChange}
        disabled={saving || !current || !next || !confirm || mismatch || weak}
        className={cn(
          "w-full h-12 rounded-2xl text-sm font-medium",
          "flex items-center justify-center gap-2 transition-all duration-150",
          saved
            ? "bg-emerald-600 text-white"
            : "bg-violet-600 text-white hover:bg-violet-500",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {saving ? (
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={16} strokeWidth={2} />
            Contraseña actualizada
          </>
        ) : (
          "Actualizar contraseña"
        )}
      </button>
    </div>
  );
}

// ─── Componentes reutilizables ────────────────────────────────────────────────

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider px-1 mb-1">
        {title}
      </p>
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800/60 divide-y divide-neutral-800/60 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const Wrapper = onPress ? "button" : "div";

  return (
    <Wrapper
      type={onPress ? "button" : undefined}
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left",
        onPress && !disabled
          ? "hover:bg-neutral-800/50 active:bg-neutral-800 transition-colors cursor-pointer"
          : "cursor-default",
        disabled && "opacity-40"
      )}
    >
      <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center flex-none">
        <Icon size={14} strokeWidth={1.5} className="text-neutral-400" />
      </div>

      <span className="flex-1 text-sm text-neutral-200">{label}</span>

      {value && (
        <span className="text-xs text-neutral-500 max-w-32 truncate text-right">
          {value}
        </span>
      )}

      {onPress && !disabled && (
        <ChevronRight size={15} strokeWidth={1.5} className="text-neutral-700 flex-none" />
      )}
    </Wrapper>
  );
}