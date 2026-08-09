"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Card from "@/components/Card";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { Product, PurchaseWithItemCount } from "@/lib/types";

type Props = {
  purchases: PurchaseWithItemCount[];
  spendByMonth: { month: string; total: number }[];
  mostPurchased: Product[];
  topSpend: Product[];
  recentSpend: number;
  avgWeeklySpend: number;
};

const HEBREW_MONTHS = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

function monthLabel(key: string) {
  const [, month] = key.split("-").map(Number);
  return HEBREW_MONTHS[month - 1] ?? key;
}

export default function StatsView({
  purchases,
  spendByMonth,
  mostPurchased,
  topSpend,
  recentSpend,
  avgWeeklySpend,
}: Props) {
  const [mode, setMode] = useState<"count" | "money">("count");

  if (purchases.length === 0) {
    return (
      <Card className="mx-5">
        <p className="text-sm text-muted">עדיין אין מספיק נתונים לסטטיסטיקות.</p>
      </Card>
    );
  }

  const diff = avgWeeklySpend > 0 ? ((recentSpend - avgWeeklySpend) / avgWeeklySpend) * 100 : 0;
  const chartData = spendByMonth.map((d) => ({ ...d, label: monthLabel(d.month) }));
  const purchaseChartData = purchases.slice(-10).map((p) => ({
    label: formatDateShort(p.purchased_at),
    items: p.item_count,
  }));
  const productList = mode === "count" ? mostPurchased : topSpend;

  return (
    <div className="space-y-5 px-5 pb-4">
      <Card>
        <p className="text-sm font-semibold text-muted">💰 הוצאות לאורך זמן</p>
        <div className="mt-3 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-muted">📦 מספר מוצרים בכל קנייה</p>
        <div className="mt-3 h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseChartData}>
              <XAxis dataKey="label" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12 }}
              />
              <Bar dataKey="items" fill="var(--accent-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-muted">השבוע לעומת הממוצע</p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">השבוע</p>
            <p className="text-lg font-bold">{formatCurrency(recentSpend)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">ממוצע</p>
            <p className="text-lg font-bold">{formatCurrency(avgWeeklySpend)}</p>
          </div>
          <p className={clsx("font-semibold", diff > 0 ? "text-tier-high" : "text-accent")}>
            {diff > 0 ? "🔴" : "🟢"} {Math.abs(diff).toFixed(0)}% {diff > 0 ? "מעל" : "מתחת ל"}ממוצע
          </p>
        </div>
      </Card>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">🏆 המוצרים שנקנו הכי הרבה</h2>
          <div className="flex gap-1 rounded-full border border-border bg-surface p-1 text-xs">
            <button
              onClick={() => setMode("count")}
              className={clsx("rounded-full px-3 py-1", mode === "count" ? "bg-accent text-background" : "text-muted")}
            >
              כמות
            </button>
            <button
              onClick={() => setMode("money")}
              className={clsx("rounded-full px-3 py-1", mode === "money" ? "bg-accent text-background" : "text-muted")}
            >
              כסף
            </button>
          </div>
        </div>
        <Card className="divide-y divide-border p-0">
          {productList.map((product, i) => (
            <div key={product.id} className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-3">
                <span className="w-5 text-center text-sm text-muted">{i + 1}</span>
                <span className="font-medium">{product.name}</span>
              </span>
              <span className="text-sm font-semibold text-muted">
                {mode === "count"
                  ? `${product.times_purchased} קניות`
                  : formatCurrency(product.total_spent)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
