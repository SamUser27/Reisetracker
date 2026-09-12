"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TripTabs({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;
  const tabs = [
    { href: base, label: "Übersicht" },
    { href: `${base}/ausgaben`, label: "Ausgaben" },
    { href: `${base}/planung`, label: "Planung" },
    { href: `${base}/infos`, label: "Infos" },
  ];

  return (
    <nav className="flex gap-1 border-b border-[var(--border)]">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors"
            style={{
              borderColor: active ? "var(--accent-terracotta)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
