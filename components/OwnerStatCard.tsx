"use client";

import type { LucideIcon } from "lucide-react";

interface OwnerStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  gold?: boolean;
}

export default function OwnerStatCard({
  icon: Icon,
  label,
  value,
  sub,
  gold = false,
}: OwnerStatCardProps) {
  return (
    <div className="bg-surface-card border border-border-card rounded-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-text-secondary" />
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`font-heading text-2xl font-bold ${gold ? "text-accent-gold" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-text-secondary text-xs mt-1">{sub}</p>}
    </div>
  );
}
