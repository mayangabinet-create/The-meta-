"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, BarChart3, History, Plus } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "בית", icon: Home },
  { href: "/list", label: "רשימה", icon: ShoppingCart },
  { href: "/add", label: "", icon: Plus, isCenter: true },
  { href: "/stats", label: "סטטיסטיקות", icon: BarChart3 },
  { href: "/history", label: "היסטוריה", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/90 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-end justify-between px-4 pt-2 pb-2">
        {LINKS.map(({ href, label, icon: Icon, isCenter }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          if (isCenter) {
            return (
              <li key={href} className="-mt-6">
                <Link
                  href={href}
                  aria-label="הוסף קנייה"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-2 text-background shadow-lg shadow-accent/30 transition-transform active:scale-95"
                >
                  <Icon size={26} strokeWidth={2.5} />
                </Link>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] transition-colors",
                  active ? "text-accent" : "text-muted"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
