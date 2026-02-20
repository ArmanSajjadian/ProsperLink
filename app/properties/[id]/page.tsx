import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  Building2,
  Users,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Layers,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { getProperty, properties, formatCurrency, getFundedPercent } from "@/lib/data";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Props) {
  const property = getProperty(params.id);
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.name} — ProsperLink`,
    description: property.description,
  };
}

const statusStyles = {
  FUNDING: { bg: "bg-accent-gold/10", text: "text-accent-gold", label: "Funding Open" },
  FUNDED: { bg: "bg-success/10", text: "text-success", label: "Fully Funded" },
  ACTIVE: { bg: "bg-success/10", text: "text-success", label: "Earning Income" },
};

export default function PropertyDetailPage({ params }: Props) {
  const property = getProperty(params.id);
  if (!property) notFound();

  const fundedPercent = getFundedPercent(property);
  const remaining = property.totalValue - property.fundedAmount;
  const status = statusStyles[property.status];

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
                src={property.image}
                alt={property.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
                <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary-dark/70 text-text-secondary">
                  {property.type}
                </span>
              </div>
            </div>

            {/* Header */}
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">{property.name}</h1>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <MapPin size={15} />
                <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
              </div>
            </div>

            {/* Key Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, label: "Token Price", value: `$${property.tokenPrice.toFixed(2)}` },
                { icon: TrendingUp, label: "Annual Yield", value: `${property.annualYield}%`, gold: true },
                { icon: Building2, label: "Property Value", value: formatCurrency(property.totalValue) },
                { icon: Layers, label: "Total Tokens", value: property.totalTokens.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="bg-surface-card border border-border-card rounded-card p-4">
                  <item.icon size={16} className={`mb-2 ${item.gold ? "text-accent-gold" : "text-text-secondary"}`} />
                  <p className="text-text-secondary text-xs mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.gold ? "text-accent-gold" : "text-white"}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-surface-card border border-border-card rounded-card p-6">
              <h2 className="font-heading text-xl font-semibold text-white mb-3">About This Property</h2>
              <p className="text-text-secondary leading-relaxed">{property.description}</p>
            </div>

            {/* Highlights */}
            <div className="bg-surface-card border border-border-card rounded-card p-6">
              <h2 className="font-heading text-xl font-semibold text-white mb-4">Key Highlights</h2>
              <ul className="space-y-3">
                {property.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                    <span className="text-text-secondary text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Property Details */}
            <div className="bg-surface-card border border-border-card rounded-card p-6">
              <h2 className="font-heading text-xl font-semibold text-white mb-4">Property Details</h2>
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
                  <p className="text-white font-semibold">{property.spvDetails.entity}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs mb-1">Jurisdiction</p>
                  <p className="text-white font-semibold">{property.spvDetails.jurisdiction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Investment Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Funding Progress Card */}
              <div className="bg-surface-card border border-border-card rounded-card p-6">
                <h3 className="font-heading text-lg font-semibold text-white mb-5">Investment Summary</h3>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-text-secondary text-sm">Funded</span>
                    <span className="text-white font-bold text-lg">{fundedPercent}%</span>
                  </div>
                  <div className="progress-bar h-3">
                    <div
                      className="progress-fill h-3"
                      style={{ width: `${fundedPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-text-secondary">{formatCurrency(property.fundedAmount)} raised</span>
                    <span className="text-xs text-text-secondary">{formatCurrency(property.totalValue)} goal</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: TrendingUp, label: "Annual Yield", value: `${property.annualYield}%`, gold: true },
                    { icon: DollarSign, label: "Token Price", value: `$${property.tokenPrice.toFixed(2)}` },
                    { icon: BarChart3, label: "Remaining", value: formatCurrency(remaining) },
                    { icon: Users, label: "Min. Investment", value: "$25" },
                    { icon: Calendar, label: "Payout Schedule", value: "Monthly" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border-card last:border-0">
                      <div className="flex items-center gap-2">
                        <item.icon size={14} className="text-text-secondary" />
                        <span className="text-text-secondary text-sm">{item.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${item.gold ? "text-accent-gold" : "text-white"}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {property.status === "FUNDING" ? (
                  <Link
                    href="/signup"
                    className="block w-full text-center bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold py-3.5 rounded-lg transition-colors"
                  >
                    Invest Now
                  </Link>
                ) : property.status === "ACTIVE" ? (
                  <div>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-3 text-center">
                      <p className="text-success text-sm font-medium">Currently generating rental income</p>
                    </div>
                    <Link
                      href="/signup"
                      className="block w-full text-center border border-accent-gold/40 hover:bg-accent-gold/10 text-accent-gold font-semibold py-3 rounded-lg transition-colors text-sm"
                    >
                      Join Waitlist for Next Raise
                    </Link>
                  </div>
                ) : (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                    <p className="text-success font-semibold">Fully Funded</p>
                    <p className="text-text-secondary text-xs mt-1">This property is no longer accepting investments</p>
                  </div>
                )}

                <p className="text-text-secondary text-xs text-center mt-3">
                  Sign up free to invest. KYC verification required.
                </p>
              </div>

              {/* SPV Info */}
              <div className="bg-surface-card border border-border-card rounded-card p-5">
                <h4 className="text-white font-semibold text-sm mb-3">Legal Structure</h4>
                <p className="text-text-secondary text-xs leading-relaxed">
                  This property is held by <span className="text-white">{property.spvDetails.entity}</span>, a{" "}
                  {property.spvDetails.jurisdiction}-registered LLC. Tokens represent equity interests in the SPV.
                  Investors are protected by the LLC structure, which isolates liability per property.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
