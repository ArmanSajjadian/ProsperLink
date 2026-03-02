"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Building2, LogOut, ChevronDown, Wallet, ShieldCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { isAdminEmail } from "@/lib/admin";

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur-sm border-b border-border-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-white tracking-tight">
              Prosper<span className="text-accent-gold">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-accent-gold"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-accent-gold transition-colors px-3 py-2 rounded-lg hover:bg-surface-card"
                >
                  <div className="w-7 h-7 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center text-accent-gold text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="hidden lg:block">{session.user?.name ?? "Account"}</span>
                  <ChevronDown size={14} className="text-text-secondary" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface-card border border-border-card rounded-card shadow-xl py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-primary-navy transition-colors"
                    >
                      <LayoutDashboard size={15} /> Investor Dashboard
                    </Link>
                    <Link
                      href="/owner/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-primary-navy transition-colors"
                    >
                      <Building2 size={15} /> Owner Portal
                    </Link>
                    <Link
                      href="/dashboard/wallet"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-primary-navy transition-colors"
                    >
                      <Wallet size={15} /> My Wallet
                    </Link>
                    {isAdminEmail(session.user?.email) && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-accent-gold hover:text-white hover:bg-primary-navy transition-colors"
                      >
                        <ShieldCheck size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="h-px bg-border-card my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-primary-navy transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white hover:text-accent-gold transition-colors px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold bg-accent-gold hover:bg-accent-gold-hover text-primary-dark px-5 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary-navy border-t border-border-card px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm font-medium py-2 transition-colors ${
                pathname === link.href
                  ? "text-accent-gold"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border-card">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-white py-2 flex items-center gap-2"
                >
                  <LayoutDashboard size={15} /> Investor Dashboard
                </Link>
                <Link
                  href="/owner/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-white py-2 flex items-center gap-2"
                >
                  <Building2 size={15} /> Owner Portal
                </Link>
                <Link
                  href="/dashboard/wallet"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-white py-2 flex items-center gap-2"
                >
                  <Wallet size={15} /> My Wallet
                </Link>
                {isAdminEmail(session.user?.email) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-accent-gold py-2 flex items-center gap-2"
                  >
                    <ShieldCheck size={15} /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="text-sm font-medium text-text-secondary py-2 text-left flex items-center gap-2"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-white py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold bg-accent-gold hover:bg-accent-gold-hover text-primary-dark px-4 py-2 rounded-lg text-center transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
