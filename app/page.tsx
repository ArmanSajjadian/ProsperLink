import Link from "next/link";
import { ArrowRight, Shield, TrendingUp, Wallet, Building2, Users, DollarSign, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { prisma } from "@/lib/prisma";

const stats = [
  { label: "Properties Listed", value: "24+" },
  { label: "Total Invested", value: "$8.2M" },
  { label: "Active Investors", value: "1,400+" },
  { label: "Avg. Annual Yield", value: "7.9%" },
];

const steps = [
  {
    icon: Building2,
    title: "Browse Properties",
    description:
      "Explore our curated selection of high-yield properties — from apartment complexes to commercial plazas. Each listing shows full financials, location, and projected returns.",
  },
  {
    icon: Wallet,
    title: "Buy Tokens",
    description:
      "Purchase digital tokens representing fractional ownership in a property's SPV. Start with as little as $25 and build a diversified real estate portfolio.",
  },
  {
    icon: DollarSign,
    title: "Earn Passive Income",
    description:
      "Receive monthly rental income distributions proportional to your token holdings. Track earnings in your dashboard and reinvest to compound returns.",
  },
];

const trustSignals = [
  {
    icon: Shield,
    title: "SEC-Compliant Structure",
    description:
      "Properties are held in individual SPV LLCs. All offerings comply with applicable securities regulations.",
  },
  {
    icon: TrendingUp,
    title: "Blockchain Transparency",
    description:
      "Token ownership recorded on Polygon blockchain. Every transaction is verifiable and immutable.",
  },
  {
    icon: Users,
    title: "KYC-Verified Investors",
    description:
      "All investors complete identity verification. A secure, compliant community of real estate investors.",
  },
];

export default async function HomePage() {
  const featuredProperties = await prisma.property.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { annualYield: "desc" },
    take: 3,
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark pt-20 pb-28 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-accent-gold/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
            Now live — Browse tokenized properties
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            Own Real Estate.{" "}
            <span className="text-accent-gold">Starting at $25.</span>
          </h1>

          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ProsperLink lets you invest in fractional ownership of income-generating properties
            through blockchain tokenization. Earn passive rental income without the landlord headaches.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-semibold px-8 py-4 rounded-lg transition-colors text-base"
            >
              Browse Properties
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-border-card hover:border-accent-gold/40 text-white font-medium px-8 py-4 rounded-lg transition-colors text-base"
            >
              How It Works
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface-card border border-border-card rounded-card p-4">
                <p className="text-2xl font-bold text-accent-gold font-heading">{stat.value}</p>
                <p className="text-text-secondary text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-4xl font-bold text-white mb-2">Featured Properties</h2>
              <p className="text-text-secondary">High-yield opportunities available now</p>
            </div>
            <Link
              href="/properties"
              className="hidden sm:flex items-center gap-1.5 text-accent-gold hover:text-accent-gold-hover text-sm font-medium transition-colors"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 text-accent-gold text-sm font-medium"
            >
              View all properties <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-primary-navy">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-bold text-white mb-3">How ProsperLink Works</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              From browsing to earning — three simple steps to start your real estate portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                    <step.icon size={28} className="text-accent-gold" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-gold text-primary-dark text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 border border-accent-gold/40 hover:bg-accent-gold/10 text-accent-gold font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Learn more about the process <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-bold text-white mb-3">Built for Trust</h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Every layer of ProsperLink is designed with security and compliance in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustSignals.map((signal, i) => (
              <div key={i} className="bg-surface-card border border-border-card rounded-card p-8">
                <div className="w-12 h-12 rounded-lg bg-accent-gold/10 flex items-center justify-center mb-5">
                  <signal.icon size={24} className="text-accent-gold" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">{signal.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-primary-navy">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to invest smarter?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Join over 1,400 investors already earning passive income through tokenized real estate.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold px-10 py-4 rounded-lg transition-colors text-lg"
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-text-secondary text-sm">No credit card required · Start investing in minutes</p>
        </div>
      </section>
    </div>
  );
}
