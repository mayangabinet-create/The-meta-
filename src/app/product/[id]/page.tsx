import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import PriorityBadge from "@/components/PriorityBadge";
import { formatCurrency, formatDate, daysAgo } from "@/lib/format";
import { getProductDetail } from "@/lib/queries";

export default async function ProductDetailPage({
  params,
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const detail = await getProductDetail(id);

  if (!detail) notFound();

  const { product, history } = detail;
  const avgPrice = product.times_purchased > 0 ? product.total_spent / product.times_purchased : 0;

  return (
    <div>
      <PageHeader title={product.name} action={<PriorityBadge score={product.priority_score} />} />
      <div className="px-5 pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-muted">נקנה</p>
            <p className="mt-1 text-xl font-bold">{product.times_purchased} פעמים</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">סה&quot;כ הוצאה</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(product.total_spent)}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">מחיר ממוצע</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(avgPrice)}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted">קנייה אחרונה</p>
            <p className="mt-1 text-xl font-bold">
              {product.last_purchased_at ? daysAgo(product.last_purchased_at) : "—"}
            </p>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted">היסטוריית קניות</h2>
          {history.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">אין עדיין היסטוריה למוצר זה.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-border p-0">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">
                      {item.purchases ? formatDate(item.purchases.purchased_at) : "—"}
                    </p>
                    <p className="text-xs text-muted">× {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
