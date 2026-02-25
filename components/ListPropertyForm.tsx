"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  MapPin,
  DollarSign,
  Building2,
  Link as LinkIcon,
  CheckCircle,
  Info,
  Plus,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PropertyType = "Residential" | "Multi-Family" | "Mixed-Use" | "Commercial";
type FormStep = 1 | 2 | 3 | 4 | 5 | "success";

interface FormState {
  // Step 1
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType | "";
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  yearBuilt: string;
  // Step 2
  totalValue: string;
  targetRaise: string;
  annualYield: string;
  monthlyRentRoll: string;
  operatingExpenses: string;
  // Step 3
  description: string;
  highlights: string[];
  imageUrl: string;
  // Step 4
  spvEntity: string;
  spvJurisdiction: string;
  ownerRetainedEquity: string;
  agreedToTerms1: boolean;
  agreedToTerms2: boolean;
}

const initialFormState: FormState = {
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  yearBuilt: "",
  totalValue: "",
  targetRaise: "",
  annualYield: "",
  monthlyRentRoll: "",
  operatingExpenses: "",
  description: "",
  highlights: [""],
  imageUrl: "",
  spvEntity: "",
  spvJurisdiction: "",
  ownerRetainedEquity: "",
  agreedToTerms1: false,
  agreedToTerms2: false,
};

const PROPERTY_TYPES: PropertyType[] = [
  "Residential",
  "Multi-Family",
  "Mixed-Use",
  "Commercial",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const SPV_JURISDICTIONS = [
  "Delaware","Wyoming","Florida","Texas","Nevada","California","Other",
];

const stepLabels = ["Basics", "Financials", "Description", "Legal", "Review"];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-8">
      {stepLabels.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-accent-gold text-primary-dark"
                    : active
                    ? "border-2 border-accent-gold bg-accent-gold/10 text-accent-gold"
                    : "border-2 border-border-card text-text-secondary"
                }`}
              >
                {done ? <CheckCircle size={14} /> : step}
              </div>
              <span
                className={`text-xs mt-1 hidden sm:block ${
                  active ? "text-accent-gold" : "text-text-secondary"
                }`}
              >
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 ${
                  done ? "bg-accent-gold" : "bg-border-card"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared input wrapper ─────────────────────────────────────────────────────

function InputField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-text-secondary text-xs font-medium mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ListPropertyFormProps {
  initialStep?: 1 | 2 | 3 | 4 | 5;
}

export default function ListPropertyForm({
  initialStep = 1,
}: ListPropertyFormProps) {
  const [step, setStep] = useState<FormStep>(initialStep);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  function step1Valid() {
    return (
      form.name.trim() !== "" &&
      form.address.trim() !== "" &&
      form.city.trim() !== "" &&
      form.state !== "" &&
      form.zipCode.length === 5 &&
      form.propertyType !== ""
    );
  }

  function step2Valid() {
    return (
      Number(form.totalValue) > 0 &&
      Number(form.targetRaise) > 0 &&
      Number(form.targetRaise) <= Number(form.totalValue) &&
      Number(form.annualYield) > 0
    );
  }

  function step3Valid() {
    return (
      form.description.trim().length >= 50 &&
      form.highlights.some((h) => h.trim() !== "")
    );
  }

  function step4Valid() {
    return (
      form.spvEntity.trim() !== "" &&
      form.spvJurisdiction !== "" &&
      form.agreedToTerms1 &&
      form.agreedToTerms2
    );
  }

  function currentStepValid() {
    if (step === 1) return step1Valid();
    if (step === 2) return step2Valid();
    if (step === 3) return step3Valid();
    if (step === 4) return step4Valid();
    return true;
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  function goNext() {
    if (typeof step === "number" && step < 5) {
      setStep((step + 1) as FormStep);
    }
  }

  function goBack() {
    if (typeof step === "number" && step > 1) {
      setStep((step - 1) as FormStep);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStep("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  // ─── Computed financials (Step 2 preview) ────────────────────────────────────

  const totalTokens = Math.floor(Number(form.targetRaise));
  const netMonthly =
    Number(form.monthlyRentRoll) - Number(form.operatingExpenses);
  const calcYield =
    Number(form.totalValue) > 0
      ? ((netMonthly * 12) / Number(form.totalValue)) * 100
      : 0;
  const yieldDiff = Math.abs(calcYield - Number(form.annualYield));
  const effectiveYield =
    calcYield > 0 && Number(form.annualYield) > 0
      ? Math.min(Number(form.annualYield), calcYield)
      : Number(form.annualYield);

  // ─── Success screen ──────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="bg-surface-card border border-border-card rounded-card p-10 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-success" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-white mb-3">
          Listing Submitted for Review!
        </h2>
        <p className="text-text-secondary text-sm mb-8 max-w-xs mx-auto">
          <strong className="text-white">{form.name || "Your property"}</strong>{" "}
          has been submitted. Our team will review your listing and documents
          within 2–3 business days.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/owner/dashboard"
            className="bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            View My Properties
          </Link>
          <Link
            href="/owner/documents"
            className="border border-border-card hover:border-accent-gold/40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Upload Documents
          </Link>
        </div>
      </div>
    );
  }

  // ─── Step content ────────────────────────────────────────────────────────────

  const inputClass =
    "w-full bg-primary-dark border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm";

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step as number} />

      <div className="bg-surface-card border border-border-card rounded-card p-6 md:p-8">
        {/* ── Step 1: Property Basics ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-white">
              Property Basics
            </h2>

            <InputField icon={Home} label="Property Name *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g., Harbor Heights Duplex"
                className={inputClass}
              />
            </InputField>

            <InputField icon={MapPin} label="Street Address *">
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street address"
                className={inputClass}
              />
            </InputField>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 col-span-2">
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                  className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  State *
                </label>
                <select
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                >
                  <option value="">—</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) =>
                    set("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  placeholder="12345"
                  maxLength={5}
                  className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Property type pills */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2">
                Property Type *
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("propertyType", t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      form.propertyType === t
                        ? "bg-accent-gold text-primary-dark"
                        : "border border-border-card text-text-secondary hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Beds / Baths / Sqft / Year */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { field: "bedrooms" as const, label: "Bedrooms", placeholder: "4" },
                { field: "bathrooms" as const, label: "Bathrooms", placeholder: "2" },
                { field: "sqft" as const, label: "Sq Ft", placeholder: "2400" },
                { field: "yearBuilt" as const, label: "Year Built", placeholder: "2012" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-text-secondary text-xs font-medium mb-1.5">
                    {label}
                  </label>
                  <input
                    type="number"
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Financial Details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-white">
              Financial Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField icon={DollarSign} label="Total Property Value *">
                <input
                  type="number"
                  value={form.totalValue}
                  onChange={(e) => set("totalValue", e.target.value)}
                  placeholder="480000"
                  className={inputClass}
                />
              </InputField>

              <InputField icon={DollarSign} label="Target Raise Amount *">
                <input
                  type="number"
                  value={form.targetRaise}
                  onChange={(e) => set("targetRaise", e.target.value)}
                  placeholder="320000"
                  className={inputClass}
                />
              </InputField>

              <InputField icon={DollarSign} label="Gross Monthly Rent Roll">
                <input
                  type="number"
                  value={form.monthlyRentRoll}
                  onChange={(e) => set("monthlyRentRoll", e.target.value)}
                  placeholder="3500"
                  className={inputClass}
                />
              </InputField>

              <InputField icon={DollarSign} label="Monthly Operating Expenses">
                <input
                  type="number"
                  value={form.operatingExpenses}
                  onChange={(e) => set("operatingExpenses", e.target.value)}
                  placeholder="800"
                  className={inputClass}
                />
              </InputField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  Target Annual Yield (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.annualYield}
                  onChange={(e) => set("annualYield", e.target.value)}
                  placeholder="7.4"
                  className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  Token Price
                </label>
                <input
                  type="text"
                  value="$1.00 (standardized)"
                  readOnly
                  className="w-full bg-primary-navy border border-border-card rounded-lg px-3 py-2.5 text-text-secondary text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Live preview panel */}
            {Number(form.targetRaise) > 0 && (
              <div className="bg-primary-navy rounded-lg p-4 space-y-2">
                <p className="text-text-secondary text-xs font-medium uppercase tracking-wide mb-2">
                  Computed Preview
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Total tokens issued</span>
                  <span className="text-white font-medium">
                    {totalTokens.toLocaleString()}
                  </span>
                </div>
                {Number(form.monthlyRentRoll) > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Net monthly income</span>
                      <span className="text-white font-medium">
                        ${netMonthly.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Calculated yield</span>
                      <span className="text-white font-medium">
                        {calcYield.toFixed(2)}%
                      </span>
                    </div>
                    {Number(form.annualYield) > 0 && yieldDiff > 2 && (
                      <p className="text-yellow-400 text-xs pt-1 flex items-start gap-1.5">
                        <Info size={12} className="mt-0.5 flex-shrink-0" />
                        Your entered yield ({form.annualYield}%) differs from the
                        calculated yield ({calcYield.toFixed(2)}%). The lower yield (
                        {effectiveYield.toFixed(2)}%) will be shown to investors.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Description ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-white">
              Description &amp; Highlights
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-text-secondary text-xs font-medium">
                  Property Description * (min 50 chars)
                </label>
                <span
                  className={`text-xs ${
                    form.description.length < 50
                      ? "text-red-400"
                      : "text-text-secondary"
                  }`}
                >
                  {form.description.length}/800
                </span>
              </div>
              <textarea
                rows={5}
                maxLength={800}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the property — location highlights, rental history, nearby amenities…"
                className="w-full bg-primary-dark border border-border-card rounded-lg px-4 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm resize-none"
              />
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2">
                Property Highlights
              </label>
              <div className="space-y-2">
                {form.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => {
                        const updated = [...form.highlights];
                        updated[i] = e.target.value;
                        set("highlights", updated);
                      }}
                      placeholder={`Highlight ${i + 1}`}
                      className="flex-1 bg-primary-dark border border-border-card rounded-lg px-3 py-2 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                    />
                    {form.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "highlights",
                            form.highlights.filter((_, idx) => idx !== i)
                          )
                        }
                        className="p-1.5 text-text-secondary hover:text-white transition-colors"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {form.highlights.length < 6 && (
                <button
                  type="button"
                  onClick={() => set("highlights", [...form.highlights, ""])}
                  className="mt-2 flex items-center gap-1.5 text-accent-gold hover:text-white text-xs font-medium transition-colors"
                >
                  <Plus size={13} />
                  Add Highlight
                </button>
              )}
            </div>

            {/* Cover image URL */}
            <InputField icon={LinkIcon} label="Cover Image URL">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
            </InputField>
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt="Cover preview"
                className="w-full max-h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <p className="text-text-secondary text-xs">
              In the full version, you&apos;ll be able to upload photos directly.
            </p>
          </div>
        )}

        {/* ── Step 4: SPV & Legal ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-white">
              SPV &amp; Legal Details
            </h2>

            {/* Info banner */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
              <Info size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-300 text-xs">
                Every property listed on ProsperLink is held through a Special
                Purpose Vehicle (SPV). Work with your attorney to establish an
                LLC before listing.
              </p>
            </div>

            <InputField icon={Building2} label="SPV Entity Name *">
              <input
                type="text"
                value={form.spvEntity}
                onChange={(e) => set("spvEntity", e.target.value)}
                placeholder="e.g., Harbor Heights Tampa LLC"
                className={inputClass}
              />
            </InputField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  SPV Jurisdiction *
                </label>
                <select
                  value={form.spvJurisdiction}
                  onChange={(e) => set("spvJurisdiction", e.target.value)}
                  className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                >
                  <option value="">Select jurisdiction</option>
                  {SPV_JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5">
                  Owner Retained Equity (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.ownerRetainedEquity}
                  onChange={(e) => set("ownerRetainedEquity", e.target.value)}
                  placeholder="30"
                  className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors text-sm"
                />
                <p className="text-text-secondary text-xs mt-1">
                  Percentage of the property you retain (not tokenized)
                </p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              {[
                {
                  key: "agreedToTerms1" as const,
                  label:
                    "I confirm this property is unencumbered or that I have authority to list it.",
                },
                {
                  key: "agreedToTerms2" as const,
                  label:
                    "I understand ProsperLink will review my listing and documents before it goes live.",
                },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-border-card bg-primary-dark text-accent-gold accent-accent-gold"
                  />
                  <span className="text-text-secondary text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 5: Review ── */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-white">
              Review Your Listing
            </h2>

            {[
              {
                title: "Property",
                rows: [
                  ["Name", form.name],
                  ["Address", `${form.address}, ${form.city}, ${form.state} ${form.zipCode}`],
                  ["Type", form.propertyType],
                  ["Size", `${form.bedrooms || "—"} bed · ${form.bathrooms || "—"} bath · ${form.sqft ? Number(form.sqft).toLocaleString() + " sqft" : "—"}`],
                ],
              },
              {
                title: "Financials",
                rows: [
                  ["Total Value", form.totalValue ? `$${Number(form.totalValue).toLocaleString()}` : "—"],
                  ["Target Raise", form.targetRaise ? `$${Number(form.targetRaise).toLocaleString()}` : "—"],
                  ["Annual Yield", effectiveYield > 0 ? `${effectiveYield.toFixed(2)}%` : "—"],
                  ["Token Price", "$1.00"],
                  ["Total Tokens", form.targetRaise ? Number(form.targetRaise).toLocaleString() : "—"],
                ],
              },
              {
                title: "SPV",
                rows: [
                  ["Entity", form.spvEntity || "—"],
                  ["Jurisdiction", form.spvJurisdiction || "—"],
                  ["Retained Equity", form.ownerRetainedEquity ? `${form.ownerRetainedEquity}%` : "—"],
                ],
              },
            ].map(({ title, rows }) => (
              <div key={title} className="bg-primary-navy rounded-lg p-4">
                <p className="text-accent-gold text-xs font-bold uppercase tracking-wide mb-3">
                  {title}
                </p>
                <div className="space-y-2">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 text-sm">
                      <span className="text-text-secondary flex-shrink-0">
                        {label}
                      </span>
                      <span className="text-white text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Highlights */}
            {form.highlights.some((h) => h.trim()) && (
              <div className="bg-primary-navy rounded-lg p-4">
                <p className="text-accent-gold text-xs font-bold uppercase tracking-wide mb-3">
                  Highlights
                </p>
                <ul className="space-y-1">
                  {form.highlights
                    .filter((h) => h.trim())
                    .map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-text-secondary"
                      >
                        <CheckCircle
                          size={13}
                          className="text-success mt-0.5 flex-shrink-0"
                        />
                        {h}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Info note */}
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
              <Info size={15} className="text-success mt-0.5 flex-shrink-0" />
              <p className="text-success text-sm">
                After submission, our team will review your listing within 2–3
                business days. You&apos;ll receive an email when your property goes
                live.
              </p>
            </div>

            {/* Submission error */}
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <Info size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div
          className={`flex items-center mt-8 pt-5 border-t border-border-card ${
            typeof step === "number" && step > 1 ? "justify-between" : "justify-end"
          }`}
        >
          {typeof step === "number" && step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="border border-border-card hover:border-accent-gold/40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}

          {typeof step === "number" && step < 5 && (
            <button
              type="button"
              onClick={goNext}
              disabled={!currentStepValid()}
              className="bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: {stepLabels[step]} →
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-dark border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Listing"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
