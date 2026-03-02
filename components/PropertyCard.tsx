import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp } from "lucide-react";
import { Property, formatCurrency, getFundedPercent } from "@/lib/data";

interface PropertyCardProps {
  property: Property;
}

const statusColors: Record<string, string> = {
  REVIEW: "text-blue-400 bg-blue-400/10",
  FUNDING: "text-accent-gold bg-accent-gold/10",
  FUNDED: "text-success bg-success/10",
  ACTIVE: "text-success bg-success/10",
};

const statusLabels: Record<string, string> = {
  REVIEW: "Coming Soon",
  FUNDING: "Funding Open",
  FUNDED: "Fully Funded",
  ACTIVE: "Earning",
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const fundedPercent = getFundedPercent(property);

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="bg-surface-card border border-border-card rounded-card overflow-hidden card-hover">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={property.imageUrl}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[property.status] ?? ""}`}>
              {statusLabels[property.status] ?? property.status}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-dark/70 text-text-secondary">
              {property.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-heading text-h3 font-semibold text-white mb-1 group-hover:text-accent-gold transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 text-text-secondary text-sm mb-4">
            <MapPin size={13} className="flex-shrink-0" />
            <span>{property.city}, {property.state}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-text-secondary text-xs mb-0.5">Token Price</p>
              <p className="text-white font-bold text-sm">${property.tokenPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-0.5">Annual Yield</p>
              <p className="text-accent-gold font-bold text-sm flex items-center gap-0.5">
                <TrendingUp size={13} />
                {property.annualYield}%
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-0.5">Property Value</p>
              <p className="text-white font-bold text-sm">{formatCurrency(property.totalValue)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-text-secondary text-xs">Funded</span>
              <span className="text-white text-xs font-semibold">{fundedPercent}%</span>
            </div>
            <div className="progress-bar h-1.5">
              <div
                className={`progress-fill h-1.5 ${property.status === "ACTIVE" || property.status === "FUNDED" ? "bg-success" : ""}`}
                style={{ width: `${fundedPercent}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-semibold py-2.5 rounded-lg transition-colors">
            View Property
          </button>
        </div>
      </div>
    </Link>
  );
}
