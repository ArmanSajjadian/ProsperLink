"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ListPropertyForm from "@/components/ListPropertyForm";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ListPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return <Spinner />;
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">
          List a New Property
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Complete all steps to submit your property for review. Our team will
          approve it within 2–3 business days.
        </p>
      </div>
      <ListPropertyForm />
    </div>
  );
}
