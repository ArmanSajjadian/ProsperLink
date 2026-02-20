"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { properties, Property } from "@/lib/data";

type StatusFilter = "ALL" | Property["status"];
type TypeFilter = "ALL" | string;
type SortOption = "yield_desc" | "yield_asc" | "value_desc" | "funded_desc";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "FUNDING", label: "Funding Open" },
  { value: "FUNDED", label: "Fully Funded" },
  { value: "ACTIVE", label: "Earning" },
];

const typeOptions = ["ALL", "Multi-Family", "Mixed-Use", "Residential", "Commercial"];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "yield_desc", label: "Highest Yield" },
  { value: "yield_asc", label: "Lowest Yield" },
  { value: "value_desc", label: "Largest Property" },
  { value: "funded_desc", label: "Most Funded" },
];

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [sort, setSort] = useState<SortOption>("yield_desc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...properties];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.location.state.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (typeFilter !== "ALL") {
      result = result.filter((p) => p.type === typeFilter);
    }

    result.sort((a, b) => {
      switch (sort) {
        case "yield_desc":
          return b.annualYield - a.annualYield;
        case "yield_asc":
          return a.annualYield - b.annualYield;
        case "value_desc":
          return b.totalValue - a.totalValue;
        case "funded_desc":
          return b.fundedAmount / b.totalValue - a.fundedAmount / a.totalValue;
        default:
          return 0;
      }
    });

    return result;
  }, [search, statusFilter, typeFilter, sort]);

  const hasActiveFilters =
    statusFilter !== "ALL" || typeFilter !== "ALL" || search.trim() !== "";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header */}
      <div className="bg-primary-navy border-b border-border-card py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-4xl font-bold text-white mb-2">Browse Properties</h1>
          <p className="text-text-secondary text-lg">
            {properties.length} tokenized properties — filter by yield, type, and funding status
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, city, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-card border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-surface-card border border-border-card rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-colors cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Mobile filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 bg-surface-card border border-border-card rounded-lg px-4 py-2.5 text-sm text-white"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (desktop) */}
          <aside className="hidden sm:block w-56 flex-shrink-0">
            <div className="bg-surface-card border border-border-card rounded-card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-sm">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-accent-gold text-xs hover:text-accent-gold-hover transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Status */}
              <div className="mb-6">
                <p className="text-text-secondary text-xs font-medium mb-3 uppercase tracking-wider">Status</p>
                <div className="space-y-2">
                  {statusOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        checked={statusFilter === opt.value}
                        onChange={() => setStatusFilter(opt.value)}
                        className="accent-accent-gold"
                      />
                      <span className={`text-sm transition-colors ${statusFilter === opt.value ? "text-white" : "text-text-secondary group-hover:text-white"}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <p className="text-text-secondary text-xs font-medium mb-3 uppercase tracking-wider">Property Type</p>
                <div className="space-y-2">
                  {typeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={typeFilter === type}
                        onChange={() => setTypeFilter(type)}
                        className="accent-accent-gold"
                      />
                      <span className={`text-sm transition-colors ${typeFilter === type ? "text-white" : "text-text-secondary group-hover:text-white"}`}>
                        {type === "ALL" ? "All Types" : type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Dropdown */}
          {filtersOpen && (
            <div className="sm:hidden fixed inset-0 z-40 bg-primary-dark/80 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-surface-card border-t border-border-card p-6 rounded-t-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={20} className="text-text-secondary" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-text-secondary text-xs font-medium mb-3 uppercase">Status</p>
                    <div className="space-y-2">
                      {statusOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status-m"
                            checked={statusFilter === opt.value}
                            onChange={() => setStatusFilter(opt.value)}
                            className="accent-accent-gold"
                          />
                          <span className="text-sm text-text-secondary">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs font-medium mb-3 uppercase">Type</p>
                    <div className="space-y-2">
                      {typeOptions.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type-m"
                            checked={typeFilter === type}
                            onChange={() => setTypeFilter(type)}
                            className="accent-accent-gold"
                          />
                          <span className="text-sm text-text-secondary">{type === "ALL" ? "All Types" : type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="mt-6 w-full bg-accent-gold text-primary-dark font-semibold py-3 rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-text-secondary text-sm">
                Showing <span className="text-white font-medium">{filtered.length}</span> properties
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-accent-gold text-sm hover:text-accent-gold-hover flex items-center gap-1"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-secondary text-lg mb-2">No properties found</p>
                <button onClick={clearFilters} className="text-accent-gold text-sm hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
