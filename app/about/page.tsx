import Link from "next/link";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";

const team = [
  {
    name: "David Sandoval",
    role: "CEO",
    initials: "DS",
  },
  {
    name: "Arman Sajjadian",
    role: "CTO",
    initials: "AS",
  },
];

const values = [
  {
    title: "Accessibility",
    description:
      "We believe real estate wealth shouldn't be reserved for the ultra-wealthy. By lowering the minimum investment to $25, we open the door for everyone.",
  },
  {
    title: "Transparency",
    description:
      "Every financial detail, legal document, and transaction is disclosed. Blockchain-recorded ownership means investors always know exactly what they own.",
  },
  {
    title: "Compliance First",
    description:
      "We work with experienced securities attorneys to ensure every offering is properly structured. Investor protection is non-negotiable.",
  },
  {
    title: "Long-term Thinking",
    description:
      "We select properties for sustainable income and appreciation potential — not short-term speculation. We're building wealth, not hype.",
  },
];

const milestones = [
  { date: "Q1 2025", event: "ProsperLink founded. Initial concept and market research." },
  { date: "Q3 2025", event: "MVP development begins. Legal framework established." },
  { date: "Q4 2025", event: "First 3 properties tokenized in test environment." },
  { date: "Q1 2026", event: "Public beta launched with 5 live property listings." },
  { date: "Q2 2026", event: "Target: 1,500 verified investors and $10M in tokenized assets." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header */}
      <div className="bg-primary-navy border-b border-border-card py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            About ProsperLink
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            We&apos;re on a mission to make real estate investing as simple and accessible as buying a stock.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white mb-5">Our Mission</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Real estate is the world&apos;s largest asset class — but for most people, it&apos;s
                completely inaccessible. A single property requires hundreds of thousands of dollars upfront,
                years of landlord experience, and ongoing management headaches.
              </p>
              <p className="text-text-secondary leading-relaxed mb-4">
                ProsperLink changes that. By tokenizing properties on the blockchain, we let anyone
                invest in fractional real estate ownership starting at just $25 — earning passive rental
                income without the barriers of traditional property ownership.
              </p>
              <p className="text-text-secondary leading-relaxed">
                We&apos;re not just building a platform. We&apos;re building a future where
                real estate wealth is democratized, transparent, and accessible to everyone.
              </p>
            </div>
            <div className="bg-surface-card border border-border-card rounded-card p-8">
              <p className="font-heading text-2xl font-bold text-accent-gold mb-2">&ldquo;</p>
              <p className="text-white text-lg leading-relaxed font-medium mb-4">
                The best investment on earth is earth.
              </p>
              <p className="text-text-secondary text-sm">
                — Louis Glickman, Real Estate Investor
              </p>
              <div className="mt-6 pt-6 border-t border-border-card">
                <p className="text-text-secondary text-sm italic">
                  We built ProsperLink because we wanted to invest in real estate ourselves —
                  but couldn&apos;t afford to. Now we&apos;re making sure no one else faces that barrier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-primary-navy">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-white mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-surface-card border border-border-card rounded-card p-6">
                <div className="w-8 h-8 rounded-lg bg-accent-gold flex items-center justify-center mb-4">
                  <span className="text-primary-dark font-bold text-sm">{String.fromCharCode(65 + i)}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-white mb-4 text-center">The Team</h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            ProsperLink was built by a team with deep expertise in real estate, blockchain technology, and securities law.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-surface-card border border-border-card rounded-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-gold font-bold font-heading">{member.initials}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-white">{member.name}</h3>
                    <p className="text-accent-gold text-sm mb-3">{member.role}</p>
                    <div className="flex gap-3 mt-3">
                      <Linkedin size={16} className="text-text-secondary hover:text-white cursor-pointer transition-colors" />
                      <Twitter size={16} className="text-text-secondary hover:text-white cursor-pointer transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-primary-navy">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-white mb-12 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border-card" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-6 pl-12 relative">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-accent-gold/10 border border-accent-gold/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-gold" />
                  </div>
                  <div>
                    <p className="text-accent-gold font-semibold text-sm font-heading mb-1">{milestone.date}</p>
                    <p className="text-text-secondary text-sm leading-relaxed">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Join us in building the future of real estate
          </h2>
          <p className="text-text-secondary mb-8">
            Whether you&apos;re an investor, a property owner, or just curious — we&apos;d love to have you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold px-8 py-3.5 rounded-lg transition-colors"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 border border-border-card hover:border-accent-gold/40 text-white font-medium px-8 py-3.5 rounded-lg transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
