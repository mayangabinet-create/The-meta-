import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import SetupNotice from "@/components/SetupNotice";
import { formatCurrency, formatDate } from "@/lib/format";
import { getHistory, isSupabaseConfigured } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <PageHeader title="היסטוריית קניות" />
        <SetupNotice />
      </div>
    );
  }

  const purchases = await getHistory();

  return (
    <div>
      <PageHeader title="היסטוריית קניות" />
      <div className="px-5 pb-4">
        {purchases.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">עדיין אין קניות שמורות.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {purchases.map((purchase) => (
              <Link
                key={purchase.id}
                href={`/history/${purchase.id}`}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div>
                  <p className="font-semibold">{formatDate(purchase.purchased_at)}</p>
                  <p className="text-sm text-muted">{purchase.item_count} מוצרים</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{formatCurrency(purchase.total)}</p>
                  <ChevronLeft size={18} className="text-muted" />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
