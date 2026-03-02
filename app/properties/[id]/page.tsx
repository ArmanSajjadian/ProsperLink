import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  Building2,
  CheckCircle,
  ArrowLeft,
  Layers,
  DollarSign,
} from "lucide-react";
import { Property, formatCurrency } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import InvestSection from "./InvestSection";

interface Props {
  params: Promise<{ id: string }>;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  REVIEW:  { bg: "bg-blue-400/10",    text: "text-blue-400",    label: "In Review" },
  FUNDING: { bg: "bg-accent-gold/10", text: "text-accent-gold", label: "Funding Open" },
  FUNDED:  { bg: "bg-success/10",     text: "text-success",     label: "Fully Funded" },
  ACTIVE:  { bg: "bg-success/10",     text: "text-success",     label: "Earning Income" },
};

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;

  const raw = await prisma.property.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!raw) notFound();

  // Serialize Date fields before passing to Client Components as props
  const property: Property = {
    ...(raw as unknown as Property),
    createdAt: raw.createdAt instanceof Date
      ? raw.createdAt.toISOString()
      : raw.createdAt,
  };

  const status = statusStyles[property.status] ?? {
    bg: "bg-white/10",
    text: "text-white",
    label: property.status,
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Back nav */}
      <div className="bg-primary-navy border-b border-border-card py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative w-full h-80 md:h-[420px] rounded-card overflow-hidden">
              <Image
                src={property.imageUrl}
                alt={property.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`text-sm font-semibold px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}
                >
                  {status.label}
                </span>
                <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary-dark/70 text-text-secondary">
                  {property.type}
                </span>
              </div>
            </div>

            {/* Header */}
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
                {property.name}
              </h1>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <MapPin size={15} />
                <span>
                  {property.address}, {property.city}, {property.state}
                </span>
              </div>
            </div>

            {/* Key Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, label: "Token Price",    value: `$${property.tokenPrice.toFixed(2)}` },
                { icon: TrendingUp, label: "Annual Yield",   value: `${property.annualYield}%`, gold: true },
                { icon: Building2,  label: "Property Value", value: formatCurrency(property.totalValue) },
                { icon: Layers,     label: "Total Tokens",   value: property.totalTokens.toLocaleString() },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-surface-card border border-border-card rounded-card p-4"
                >
                  <item.icon
                    size={16}
                    className={`mb-2 ${item.gold ? "text-accent-gold" : "text-text-secondary"}`}
                  />
                  <p className="text-text-secondary text-xs mb-1">{item.label}</p>
                  <p
                    className={`text-lg font-bold ${
                      item.gold ? "text-accent-gold" : "text-white"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-surface-card border border-border-card rounded-card p-6">
              <h2 className="font-heading text-xl font-semibold text-white mb-3">
                About This Property
              </h2>
              <p className="text-text-secondary leading-relaxed">{property.description}</p>
            </div>

            {/* Highlights */}
            {property.highlights.length > 0 && (
              <div className="bg-surface-card border border-border-card rounded-card p-6">
                <h2 className="font-heading text-xl font-semibold text-white mb-4">
                  Key Highlights
                </h2>
                <ul className="space-y-3">
                  {property.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-surface-card border border-border-card rounded-card p-6">
              <h2 className="font-heading text-xl font-semibold text-white mb-4">
                Property Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.bedrooms && (
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Bedrooms / Units</p>
                    <p className="text-white font-semibold">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Bathrooms</p>
                    <p className="text-white font-semibold">{property.bathrooms}</p>
                  </div>
                )}
                {property.sqft && (
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Total Sq Ft</p>
                    <p className="text-white font-semibold">{property.sqft.toLocaleString()}</p>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Year Built</p>
                    <p className="text-white font-semibold">{property.yearBuilt}</p>
                  </div>
                )}
                <div>
                  <p className="text-text-secondary text-xs mb-1">SPV Entity</p>
                  <p className="text-white font-semibold">{property.spvEntity}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs mb-1">Jurisdiction</p>
                  <p className="text-white font-semibold">{property.jurisdiction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Investment Panel */}
          <InvestSection property={property} />
        </div>
      </div>
    </div>
  );
}
