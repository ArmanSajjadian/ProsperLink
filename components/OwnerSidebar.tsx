"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  PlusCircle,
  FolderOpen,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/owner/dashboard", icon: Building2, label: "My Properties" },
  { href: "/owner/list", icon: PlusCircle, label: "List Property" },
  { href: "/owner/documents", icon: FolderOpen, label: "Documents" },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 flex-shrink-0 hidden md:flex flex-col">
      <div className="bg-surface-card border border-border-card rounded-card p-4 flex flex-col h-full sticky top-24">
        {/* Portal label */}
        <div className="mb-4 pb-3 border-b border-border-card">
          <p className="text-accent-gold text-xs font-bold uppercase tracking-widest">
            Owner Portal
          </p>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-card">
          <div className="w-9 h-9 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center text-accent-gold text-sm font-bold flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? "O"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {session?.user?.name ?? "Property Owner"}
            </p>
            <p className="text-text-secondary text-xs truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/owner/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-gold/10 text-accent-gold"
                    : "text-text-secondary hover:text-white hover:bg-primary-navy"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}

          {/* Divider + crosslink to Investor Dashboard */}
          <div className="pt-3 mt-3 border-t border-border-card">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-primary-navy transition-colors"
            >
              <TrendingUp size={16} />
              Investor View
            </Link>
          </div>
        </nav>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-primary-navy transition-colors mt-4 pt-4 border-t border-border-card w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
