import Link from "next/link";
import { ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import Card from "@/components/Card";
import PriorityBadge from "@/components/PriorityBadge";
import SetupNotice from "@/components/SetupNotice";
import { formatCurrency, daysAgo } from "@/lib/format";
import { getDashboardData, isSupabaseConfigured } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <div className="px-5 pt-6">
          <h1 className="text-2xl font-bold">🛒 Smart Shopping</h1>
        </div>
        <SetupNotice />
      </div>
    );
  }

  const { monthSpend, changePct, lastPurchase, highPriorityCount, topProducts } =
    await getDashboardData();

  return (
    <div className="space-y-5 px-5 pt-6">
      <h1 className="text-2xl font-bold">🛒 Smart Shopping</h1>

      <Card>
        <p className="text-sm text-muted">הוצאה החודש</p>
        <p className="mt-1 text-4xl font-extrabold">{formatCurrency(monthSpend)}</p>
        {changePct !== null && (
          <p
            className={`mt-2 flex items-center gap-1 text-sm font-medium ${
              changePct >= 0 ? "text-tier-high" : "text-accent"
            }`}
          >
            {changePct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(changePct).toFixed(0)}% לעומת החודש הקודם
          </p>
        )}
      </Card>

      {lastPurchase && (
        <Card>
          <p className="text-sm text-muted">הקנייה האחרונה</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold">{formatCurrency(lastPurchase.total)}</p>
            <p className="text-sm text-muted">{lastPurchase.item_count} מוצרים</p>
          </div>
          <p className="mt-1 text-xs text-muted">{daysAgo(lastPurchase.purchased_at)}</p>
        </Card>
      )}

      <Link href="/list" className="block">
        <Card className="border-accent/30 bg-accent/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <ShoppingCart size={18} className="text-accent" />
                מה כדאי לקנות?
              </p>
              <p className="mt-1 text-sm text-muted">
                {highPriorityCount} מוצרים בעלי עדיפות גבוהה
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background">
              צור רשימת קניות
            </span>
          </div>
        </Card>
      </Link>

      <div>
        <h2 className="mb-2 text-lg font-bold">🔥 Top Products</h2>
        {topProducts.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">עדיין אין נתונים — הוסיפו קנייה ראשונה כדי להתחיל.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {topProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm text-muted">
                    {["🥇", "🥈", "🥉"][i] ?? i + 1}
                  </span>
                  <span className="font-medium">{product.name}</span>
                </span>
                <PriorityBadge score={product.priority_score} />
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
