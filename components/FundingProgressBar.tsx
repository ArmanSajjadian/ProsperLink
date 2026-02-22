"use client";

interface FundingProgressBarProps {
  funded: number;
  total: number;
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
}

export default function FundingProgressBar({
  funded,
  total,
  showLabel = true,
  height = "md",
}: FundingProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((funded / total) * 100)) : 0;

  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[height];

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="text-text-secondary">
            ${funded.toLocaleString()} raised
          </span>
          <span className="text-accent-gold font-bold">{percent}%</span>
        </div>
      )}
      <div className={`progress-bar w-full ${heightClass}`}>
        <div
          className="progress-fill h-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-text-secondary text-xs mt-1">
          of ${total.toLocaleString()} goal
        </p>
      )}
    </div>
  );
}
