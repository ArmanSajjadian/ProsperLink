import Link from "next/link";
import {
  Building2,
  Wallet,
  DollarSign,
  Shield,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Lock,
  Globe,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "A Property Owner Lists Their Asset",
    description:
      "A property owner (or developer) submits their property to ProsperLink for review. Our team verifies ownership, conducts due diligence, and works with legal counsel to establish a Special Purpose Vehicle (SPV LLC) that will hold the property.",
    details: [
      "Professional property evaluation and valuation",
      "SPV LLC formation in Delaware",
      "Legal documentation and disclosure preparation",
      "Admin review and approval before going live",
    ],
  },
  {
    number: "02",
    icon: Globe,
    title: "Property is Tokenized on Polygon",
    description:
      "Once approved, the property is tokenized using an ERC-1155 smart contract on Polygon blockchain. The total property value is divided into digital tokens — typically priced at $1.25 each — representing fractional equity interests in the SPV.",
    details: [
      "ERC-1155 smart contract deployed on Polygon",
      "Token price set at $1.25 per token",
      "Maximum token supply = property value ÷ token price",
      "Smart contract code is publicly verifiable on-chain",
    ],
  },
  {
    number: "03",
    icon: Shield,
    title: "Investors Complete KYC Verification",
    description:
      "To comply with securities regulations and prevent fraud, all investors must complete identity verification (KYC/AML) before investing. This takes just a few minutes and is required once per account.",
    details: [
      "Government ID verification",
      "Address and liveness check",
      "Accreditation status verification (if applicable)",
      "AML screening against global watchlists",
    ],
  },
  {
    number: "04",
    icon: Wallet,
    title: "Investors Buy Tokens",
    description:
      "Verified investors browse properties and purchase tokens representing fractional ownership. You can start with as little as $25 (20 tokens). Purchases are made through your connected crypto wallet or via fiat on-ramp.",
    details: [
      "Minimum investment: $25 (20 tokens at $1.25)",
      "Pay with crypto wallet or credit card via on-ramp",
      "Tokens held in your non-custodial wallet",
      "Ownership immediately recorded on-chain",
    ],
  },
  {
    number: "05",
    icon: DollarSign,
    title: "Earn Monthly Rental Income",
    description:
      "Once a property is funded and operational, rental income is collected by the property manager and distributed proportionally to all token holders every month. Your share is based on your ownership percentage.",
    details: [
      "Monthly distributions paid to all token holders",
      "Amount proportional to your token ownership %",
      "Distributions sent directly to your wallet",
      "View payout history in your investor dashboard",
    ],
  },
  {
    number: "06",
    icon: TrendingUp,
    title: "Track Portfolio & Compound Returns",
    description:
      "Your investor dashboard gives you full visibility into your portfolio — total value, monthly income, property performance, and transaction history. Reinvest payouts to compound your returns over time.",
    details: [
      "Real-time portfolio value tracking",
      "Earnings-over-time charts and analytics",
      "Per-property ownership breakdown",
      "One-click reinvestment into new properties",
    ],
  },
];

const faqs = [
  {
    q: "Is this available to non-accredited investors?",
    a: "We're building under Regulation CF (crowdfunding) to allow all U.S. investors to participate. Depending on the specific offering, Regulation D (506c) offerings may be limited to accredited investors only. This will be clearly disclosed on each property listing.",
  },
  {
    q: "What are the fees?",
    a: "ProsperLink charges a 1% platform fee on token purchases and a 10% management fee on rental distributions. There are no hidden fees. All fees are disclosed transparently on each property listing.",
  },
  {
    q: "Can I sell my tokens?",
    a: "Secondary market trading (selling tokens to other investors) is on our roadmap for Phase 2. In the MVP, tokens are held until the property is sold or the SPV is wound down. Liquidity events include property sale proceeds distributed to token holders.",
  },
  {
    q: "What happens if a property doesn't fully fund?",
    a: "If a property doesn't reach its funding target within the offering period, all invested capital is returned to investors. ProsperLink only closes an offering when the full target is reached.",
  },
  {
    q: "How are properties selected?",
    a: "Our team evaluates every submission for income stability, location quality, management quality, financial transparency, and legal compliance. We target properties with a minimum 5% annual yield and strong occupancy history.",
  },
  {
    q: "What blockchain does ProsperLink use?",
    a: "We use Polygon (PoS), an EVM-compatible blockchain with low transaction fees (fractions of a cent). This makes small-ticket fractional investing economically viable. Contracts are audited and publicly verifiable.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header */}
      <div className="bg-primary-navy border-b border-border-card py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            How ProsperLink Works
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            From property listing to monthly income — a transparent, end-to-end process
            built on blockchain technology and securities-compliant legal structures.
          </p>
        </div>
      </div>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 md:gap-8">
                {/* Step number + line */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center flex-shrink-0">
                    <step.icon size={22} className="text-accent-gold" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-border-card mt-4 mb-0 min-h-[2rem]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-12">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-accent-gold text-sm font-bold font-heading">{step.number}</span>
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-white">{step.title}</h2>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                        <span className="text-text-secondary text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Structure */}
      <section className="py-20 px-4 bg-primary-navy">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-white mb-4 text-center">
            The Legal Structure
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
            Each property on ProsperLink is isolated in its own legal entity, protecting investors
            from liability across properties.
          </p>

          <div className="bg-surface-card border border-border-card rounded-card p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-center">
              {[
                {
                  label: "Real Property",
                  sub: "Physical real estate asset",
                  icon: Building2,
                  color: "border-accent-gold/30 bg-accent-gold/5",
                },
                {
                  label: "SPV LLC",
                  sub: "Special Purpose Vehicle\n(Delaware LLC)",
                  icon: Shield,
                  color: "border-accent-gold/30 bg-accent-gold/5",
                },
                {
                  label: "Digital Tokens",
                  sub: "ERC-1155 tokens on Polygon\nrepresenting equity in SPV",
                  icon: Lock,
                  color: "border-accent-gold/30 bg-accent-gold/5",
                },
                {
                  label: "Token Holders",
                  sub: "Fractional investors\nearning rental income",
                  icon: Wallet,
                  color: "border-success/30 bg-success/5",
                },
              ].map((item, i, arr) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
                  <div className={`border ${item.color} rounded-xl p-5 text-center w-44`}>
                    <item.icon size={24} className="text-accent-gold mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-text-secondary text-xs mt-1 leading-snug whitespace-pre-line">{item.sub}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight size={20} className="text-border-card md:mx-3 rotate-90 md:rotate-0 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-card border border-border-card rounded-card p-6">
                <div className="flex items-start gap-3 mb-3">
                  <HelpCircle size={18} className="text-accent-gold flex-shrink-0 mt-0.5" />
                  <h3 className="font-heading text-base font-semibold text-white">{faq.q}</h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary-navy">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Ready to start building your portfolio?
          </h2>
          <p className="text-text-secondary mb-8">
            Browse available properties and make your first investment in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold px-8 py-3.5 rounded-lg transition-colors"
            >
              Browse Properties <ArrowRight size={18} />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 border border-border-card hover:border-accent-gold/40 text-white font-medium px-8 py-3.5 rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
