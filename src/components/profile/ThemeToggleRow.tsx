// src/components/profile/ThemeToggleRow.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro",    icon: Sun },
  { value: "dark",  label: "Oscuro",   icon: Moon },
  { value: "system",label: "Sistema",  icon: Monitor },
] as const;

export function ThemeToggleRow() {
  const { theme, setTheme } = useTheme();
  // Evitar hidratación incorrecta — next-themes no sabe el tema en SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {/* Icono */}
      <div className="w-7 h-7 rounded-lg bg-neutral-800 dark:bg-neutral-800 flex items-center justify-center flex-none">
        {mounted && theme === "light" ? (
          <Sun size={14} strokeWidth={1.5} className="text-neutral-400" />
        ) : (
          <Moon size={14} strokeWidth={1.5} className="text-neutral-400" />
        )}
      </div>

      {/* Label */}
      <span className="flex-1 text-sm text-neutral-200 dark:text-neutral-200">
        Tema
      </span>

      {/* Selector de 3 opciones */}
      {mounted && (
        <div className="flex gap-1 bg-neutral-800 dark:bg-neutral-800 rounded-lg p-0.5">
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-label={label}
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150",
                theme === value
                  ? "bg-neutral-600 dark:bg-neutral-600 text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Icon size={13} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}