// src/components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BookMarked,
  BarChart2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Inicio",
    icon: LayoutDashboard,
  },
  {
    href: "/search",
    label: "Buscar",
    icon: Search,
  },
  {
    href: "/library",
    label: "Biblioteca",
    icon: BookMarked,
  },
  {
    href: "/stats",
    label: "Estadísticas",
    icon: BarChart2,
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: UserCircle,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800/60"
      aria-label="Navegación principal"
    >
      <ul className="flex h-full items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          // Activo si la ruta coincide exactamente (inicio) o comienza con href
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-1 text-[10px] font-medium tracking-wide transition-colors duration-150 select-none",
                  isActive
                    ? "text-violet-400"
                    : "text-neutral-500 hover:text-neutral-300 active:text-neutral-100"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Indicador activo — barra superior sutil */}
                <span
                  className={cn(
                    "absolute top-0 w-8 h-0.5 rounded-full transition-all duration-200",
                    isActive ? "bg-violet-400 opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />

                {/* Fondo pill al activo */}
                <span
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-colors duration-150",
                    isActive ? "bg-violet-500/15" : "bg-transparent"
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                    aria-hidden="true"
                  />
                </span>

                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}