import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-navy border-t border-border-card mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="font-heading text-xl font-bold text-white">
              Prosper<span className="text-accent-gold">Link</span>
            </span>
            <p className="mt-3 text-text-secondary text-sm leading-relaxed max-w-xs">
              Democratizing real estate investment through blockchain tokenization.
              Invest smarter, starting from $25.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {[
                { href: "/properties", label: "Browse Properties" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-secondary hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Investor Accreditation"].map((item) => (
                <li key={item}>
                  <span className="text-text-secondary text-sm cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border-card flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-xs">
            © 2026 ProsperLink Inc. All rights reserved.
          </p>
          <p className="text-text-secondary text-xs text-center sm:text-right max-w-md">
            Investments in tokenized real estate involve risk. This is not financial advice.
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
