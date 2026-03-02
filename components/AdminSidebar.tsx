"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileCheck,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/listings", icon: Building2, label: "Listings" },
  { href: "/admin/documents", icon: FileCheck, label: "Documents" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 flex-shrink-0 hidden md:flex flex-col">
      <div className="bg-surface-card border border-border-card rounded-card p-4 flex flex-col h-full sticky top-24">
        {/* Admin badge */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border-card">
          <div className="w-9 h-9 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-accent-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{session?.user?.name ?? "Admin"}</p>
            <p className="text-accent-gold text-xs font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
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
