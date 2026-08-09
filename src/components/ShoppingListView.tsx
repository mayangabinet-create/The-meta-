"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { priorityTier } from "@/lib/types";
import Card from "@/components/Card";

const LENGTHS = [
  { id: "short", label: "קצרה" },
  { id: "regular", label: "רגילה" },
  { id: "full", label: "מלאה" },
] as const;

type Length = (typeof LENGTHS)[number]["id"];

const TIER_LABEL: Record<ReturnType<typeof priorityTier>, string> = {
  high: "🔥 עדיפות גבוהה",
  medium: "🟠 עדיפות בינונית",
  low: "🟡 עדיפות נמוכה",
};

export default function ShoppingListView({ products }: { products: Product[] }) {
  const [length, setLength] = useState<Length>("regular");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (length === "short") return products.slice(0, 5);
    if (length === "regular") return products.filter((p) => p.priority_score >= 5);
    return products;
  }, [products, length]);

  const grouped = useMemo(() => {
    const groups: Record<ReturnType<typeof priorityTier>, Product[]> = {
      high: [],
      medium: [],
      low: [],
    };
    for (const product of filtered) {
      groups[priorityTier(product.priority_score)].push(product);
    }
    return groups;
  }, [filtered]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (products.length === 0) {
    return (
      <Card className="mx-5">
        <p className="text-sm text-muted">עדיין אין מוצרים במערכת — הוסיפו קנייה ראשונה.</p>
      </Card>
    );
  }

  return (
    <div className="px-5 pb-4">
      <div className="mb-4 flex gap-2 rounded-full border border-border bg-surface p-1">
        {LENGTHS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setLength(opt.id)}
            className={clsx(
              "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
              length === opt.id ? "bg-accent text-background" : "text-muted"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {(["high", "medium", "low"] as const).map((tier) =>
          grouped[tier].length === 0 ? null : (
            <div key={tier}>
              <h2 className="mb-2 text-sm font-semibold text-muted">{TIER_LABEL[tier]}</h2>
              <Card className="divide-y divide-border p-0">
                {grouped[tier].map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(product.id)}
                      onChange={() => toggle(product.id)}
                      className="h-5 w-5 accent-accent"
                    />
                    <span
                      className={clsx(
                        "flex-1 font-medium",
                        checked.has(product.id) && "text-muted line-through"
                      )}
                    >
                      {product.name}
                    </span>
                    <span className="text-sm text-muted">{product.priority_score}</span>
                  </label>
                ))}
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
}
