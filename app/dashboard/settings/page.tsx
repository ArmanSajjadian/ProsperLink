"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { User, Mail, Shield, Bell, Wallet, CheckCircle, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your profile, KYC status, and notifications</p>
      </div>

      {/* Profile */}
      <div className="bg-surface-card border border-border-card rounded-card p-6">
        <h2 className="font-heading text-base font-semibold text-white mb-4 flex items-center gap-2">
          <User size={16} className="text-accent-gold" /> Profile Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-xs mb-1.5">Full Name</label>
            <input
              type="text"
              defaultValue={session.user?.name ?? ""}
              className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                defaultValue={session.user?.email ?? ""}
                readOnly
                className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:outline-none cursor-not-allowed"
              />
              <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
          </div>
          <div>
            <label className="block text-text-secondary text-xs mb-1.5">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs mb-1.5">Country</label>
            <select className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-colors">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>
        </div>
        <button className="mt-4 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Save Changes
        </button>
      </div>

      {/* KYC Status */}
      <div className="bg-surface-card border border-border-card rounded-card p-6">
        <h2 className="font-heading text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Shield size={16} className="text-accent-gold" /> Identity Verification (KYC)
        </h2>
        <div className="flex items-start gap-4 p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-lg">
          <AlertCircle size={20} className="text-accent-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium">Verification Pending</p>
            <p className="text-text-secondary text-xs mt-1 leading-relaxed">
              Complete identity verification to start investing. You&apos;ll need a government-issued ID and
              proof of address. This takes 2–5 minutes and is required by securities regulations.
            </p>
            <button className="mt-3 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Start Verification
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[
            { label: "Email verification", done: true },
            { label: "Government ID upload", done: false },
            { label: "Liveness check", done: false },
            { label: "AML screening", done: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              {item.done
                ? <CheckCircle size={15} className="text-success" />
                : <div className="w-3.5 h-3.5 rounded-full border-2 border-border-card" />
              }
              <span className={`text-sm ${item.done ? "text-white" : "text-text-secondary"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Wallets */}
      <div className="bg-surface-card border border-border-card rounded-card p-6">
        <h2 className="font-heading text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Wallet size={16} className="text-accent-gold" /> Connected Wallets
        </h2>
        <div className="p-4 bg-primary-navy border border-border-card rounded-lg text-center">
          <Wallet size={24} className="text-text-secondary mx-auto mb-2" />
          <p className="text-text-secondary text-sm">No wallet connected yet</p>
          <p className="text-text-secondary text-xs mt-1">Connect a crypto wallet to enable token ownership and payouts</p>
          <button className="mt-3 border border-accent-gold/40 hover:bg-accent-gold/10 text-accent-gold text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Connect Wallet (Coming Soon)
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-card border border-border-card rounded-card p-6">
        <h2 className="font-heading text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={16} className="text-accent-gold" /> Notification Preferences
        </h2>
        <div className="space-y-3">
          {[
            { label: "Payout received", sub: "Get notified when rental income is distributed", on: true },
            { label: "Property updates", sub: "News and announcements from properties you own", on: true },
            { label: "New listings", sub: "Be the first to know about new investment opportunities", on: false },
            { label: "KYC status", sub: "Updates on your identity verification status", on: true },
          ].map((notif) => (
            <div key={notif.label} className="flex items-center justify-between py-2 border-b border-border-card last:border-0">
              <div>
                <p className="text-white text-sm">{notif.label}</p>
                <p className="text-text-secondary text-xs">{notif.sub}</p>
              </div>
              <button
                className={`relative w-10 h-5 rounded-full transition-colors ${notif.on ? "bg-accent-gold" : "bg-border-card"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notif.on ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
