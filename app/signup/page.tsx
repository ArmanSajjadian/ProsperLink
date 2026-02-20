import Link from "next/link";
import { ArrowRight, Mail, Lock, User, CheckCircle, Wallet } from "lucide-react";

const benefits = [
  "Start investing from $25",
  "Earn monthly passive income",
  "Blockchain-verified ownership",
  "No landlord hassles",
];

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Panel */}
        <div className="hidden md:block">
          <span className="font-heading text-2xl font-bold text-white mb-8 block">
            Prosper<span className="text-accent-gold">Link</span>
          </span>
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Start building your real estate portfolio today.
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Join thousands of investors earning passive income through blockchain-tokenized property ownership.
          </p>
          <ul className="space-y-3">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-success flex-shrink-0" />
                <span className="text-text-secondary text-sm">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 p-5 bg-surface-card border border-border-card rounded-card">
            <p className="text-text-secondary text-xs italic leading-relaxed">
              &ldquo;I never thought I could own a piece of a Nashville apartment complex earning 7.5% annually.
              ProsperLink made it possible for $250.&rdquo;
            </p>
            <p className="text-white text-sm font-medium mt-3">— Beta Investor, Austin TX</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-bold text-white">
                Prosper<span className="text-accent-gold">Link</span>
              </span>
            </Link>
          </div>

          <div className="bg-surface-card border border-border-card rounded-card p-8">
            <h1 className="font-heading text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-text-secondary text-sm mb-6">Free to join. KYC required to invest.</p>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">First Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full bg-primary-dark border border-border-card rounded-lg pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-primary-dark border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    className="w-full bg-primary-dark border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input type="checkbox" className="accent-accent-gold mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary text-xs leading-relaxed">
                    I agree to ProsperLink&apos;s{" "}
                    <span className="text-accent-gold hover:underline cursor-pointer">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-accent-gold hover:underline cursor-pointer">Privacy Policy</span>.
                    I understand this platform involves investment risk.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Create Account <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border-card" />
              <span className="text-text-secondary text-xs">or</span>
              <div className="flex-1 h-px bg-border-card" />
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 border border-border-card hover:border-accent-gold/30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </button>

              <button className="w-full flex items-center justify-center gap-3 border border-border-card hover:border-accent-gold/30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                <Wallet size={16} className="text-accent-gold" />
                Sign up with Wallet
              </button>
            </div>
          </div>

          <p className="text-center text-text-secondary text-sm mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-gold hover:text-accent-gold-hover font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
