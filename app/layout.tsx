import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "ProsperLink — Fractional Real Estate Investment",
  description:
    "Invest in tokenized real estate starting from $25. Browse properties, earn passive rental income, and build wealth through blockchain-powered fractional ownership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-primary-dark text-white antialiased">
        <SessionProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
