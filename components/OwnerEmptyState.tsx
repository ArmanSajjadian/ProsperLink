"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface OwnerEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function OwnerEmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: OwnerEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-card border border-border-card flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-secondary" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-text-secondary text-sm max-w-xs mb-6">{description}</p>
      <Link
        href={ctaHref}
        className="bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
