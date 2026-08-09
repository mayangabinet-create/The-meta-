import { priorityTier } from "@/lib/types";
import clsx from "clsx";

const TIER_STYLE = {
  high: { emoji: "🔥", classes: "bg-tier-high/15 text-tier-high" },
  medium: { emoji: "🟠", classes: "bg-tier-medium/15 text-tier-medium" },
  low: { emoji: "🟡", classes: "bg-tier-low/15 text-tier-low" },
} as const;

export default function PriorityBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const tier = priorityTier(score);
  const { emoji, classes } = TIER_STYLE[tier];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        classes,
        className
      )}
    >
      <span>{emoji}</span>
      <span>{score}/10</span>
    </span>
  );
}
