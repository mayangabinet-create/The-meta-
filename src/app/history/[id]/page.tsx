import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPurchaseDetail } from "@/lib/queries";

export default async function PurchaseDetailPage({
  params,
}: PageProps<"/history/[id]">) {
  const { id } = await params;
  const detail = await getPurchaseDetail(id);

  if (!detail) notFound();

  const { purchase, items } = detail;

  return (
    <div>
      <PageHeader
        title={formatDate(purchase.purchased_at)}
        subtitle={purchase.store ?? undefined}
      />
      <div className="px-5 pb-4 space-y-4">
        <Card className="divide-y divide-border p-0">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-muted">× {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatCurrency(item.price)}</p>
            </div>
          ))}
        </Card>
        <Card className="flex items-center justify-between">
          <span className="font-semibold text-muted">סה&quot;כ</span>
          <span className="text-xl font-extrabold">{formatCurrency(purchase.total)}</span>
        </Card>
      </div>
    </div>
  );
}
