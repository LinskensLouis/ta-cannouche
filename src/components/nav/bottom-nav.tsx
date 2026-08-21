"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { FeedIcon, SearchIcon, ScanIcon, StatsIcon, ProfileIcon } from "./icons";

type Tab = {
  href: string;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  center?: boolean;
};

// Onglets, dans l'ordre de SPECS §3.2. Le scan occupe la position centrale
// en bouton flottant proéminent.
const TABS: Tab[] = [
  { href: "/", label: "Feed", Icon: FeedIcon },
  { href: "/recherche", label: "Recherche", Icon: SearchIcon },
  { href: "/scan", label: "Scan", Icon: ScanIcon, center: true },
  { href: "/stats", label: "Stats", Icon: StatsIcon },
  { href: "/profil", label: "Profil", Icon: ProfileIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-alu-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-16 max-w-[520px] items-stretch justify-around">
        {TABS.map(({ href, label, Icon, center }) => {
          const active = isActive(pathname, href);

          if (center) {
            // Bouton scan : cercle orange surélevé au-dessus de la barre.
            return (
              <li key={href} className="flex items-center justify-center">
                <Link
                  href={href}
                  aria-label={label}
                  className="-mt-6 flex size-16 items-center justify-center rounded-full bg-serigraphie text-alu-fond shadow-lg ring-4 ring-alu-fond active:scale-95"
                >
                  <ScanIcon width={28} height={28} />
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex h-full min-h-12 flex-col items-center justify-center gap-1 ${
                  active ? "text-serigraphie" : "text-alu-mat"
                }`}
              >
                <Icon />
                <span className="text-[11px] leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
