"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Mail, Lock, Wallet, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-heading text-2xl font-bold text-white">
              Prosper<span className="text-accent-gold">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm">Sign in to your investor account</p>
        </div>

        <div className="bg-surface-card border border-border-card rounded-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-primary-dark border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-white">Password</label>
                <span className="text-accent-gold text-xs cursor-pointer hover:underline">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-primary-dark border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-gold hover:bg-accent-gold-hover disabled:opacity-60 text-primary-dark font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Signing in..." : <><span>Sign In</span> <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border-card" />
            <span className="text-text-secondary text-xs">or continue with</span>
            <div className="flex-1 h-px bg-border-card" />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 border border-border-card hover:border-accent-gold/30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button className="w-full flex items-center justify-center gap-3 border border-border-card hover:border-accent-gold/30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              <Wallet size={18} className="text-accent-gold" />
              Connect Wallet (Coming Soon)
            </button>
          </div>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent-gold hover:text-accent-gold-hover font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
