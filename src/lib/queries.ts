import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Product, Purchase, PurchaseItem, PurchaseWithItemCount } from "@/lib/types";

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export async function getDashboardData() {
  const supabase = supabaseServer();

  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  const [thisMonthRes, lastMonthRes, lastPurchaseRes, productsRes] = await Promise.all([
    supabase
      .from("purchases")
      .select("total")
      .gte("purchased_at", thisMonth.start)
      .lt("purchased_at", thisMonth.end),
    supabase
      .from("purchases")
      .select("total")
      .gte("purchased_at", lastMonth.start)
      .lt("purchased_at", lastMonth.end),
    supabase
      .from("purchases")
      .select("*, purchase_items(count)")
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("products").select("*").order("priority_score", { ascending: false }),
  ]);

  const monthSpend = (thisMonthRes.data ?? []).reduce((sum, p) => sum + Number(p.total), 0);
  const prevMonthSpend = (lastMonthRes.data ?? []).reduce((sum, p) => sum + Number(p.total), 0);
  const changePct = prevMonthSpend > 0 ? ((monthSpend - prevMonthSpend) / prevMonthSpend) * 100 : null;

  const rawLast = lastPurchaseRes.data as (Purchase & { purchase_items: { count: number }[] }) | null;
  const lastPurchase = rawLast
    ? { ...rawLast, item_count: rawLast.purchase_items?.[0]?.count ?? 0 }
    : null;

  const products = (productsRes.data ?? []) as Product[];
  const highPriorityCount = products.filter((p) => p.priority_score >= 7).length;
  const topProducts = products.slice(0, 5);

  return { monthSpend, changePct, lastPurchase, highPriorityCount, topProducts };
}

export async function getShoppingList(): Promise<Product[]> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("priority_score", { ascending: false })
    .order("name", { ascending: true });
  return (data ?? []) as Product[];
}

export async function getHistory(): Promise<PurchaseWithItemCount[]> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("purchases")
    .select("*, purchase_items(count)")
    .order("purchased_at", { ascending: false })
    .order("created_at", { ascending: false });

  return ((data ?? []) as (Purchase & { purchase_items: { count: number }[] })[]).map((p) => ({
    ...p,
    item_count: p.purchase_items?.[0]?.count ?? 0,
  }));
}

export async function getPurchaseDetail(id: string) {
  const supabase = supabaseServer();
  const [purchaseRes, itemsRes] = await Promise.all([
    supabase.from("purchases").select("*").eq("id", id).maybeSingle(),
    supabase.from("purchase_items").select("*").eq("purchase_id", id).order("created_at"),
  ]);

  if (!purchaseRes.data) return null;

  return {
    purchase: purchaseRes.data as Purchase,
    items: (itemsRes.data ?? []) as PurchaseItem[],
  };
}

export async function getProductDetail(id: string) {
  const supabase = supabaseServer();
  const [productRes, historyRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("purchase_items")
      .select("*, purchases(purchased_at, store)")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!productRes.data) return null;

  return {
    product: productRes.data as Product,
    history: (historyRes.data ?? []) as (PurchaseItem & {
      purchases: { purchased_at: string; store: string | null } | null;
    })[],
  };
}

export async function getStats() {
  const supabase = supabaseServer();
  const [purchasesRes, byTimesRes, bySpendRes] = await Promise.all([
    supabase
      .from("purchases")
      .select("*, purchase_items(count)")
      .order("purchased_at", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .order("times_purchased", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("*")
      .order("total_spent", { ascending: false })
      .limit(8),
  ]);

  const purchases = ((purchasesRes.data ?? []) as (Purchase & {
    purchase_items: { count: number }[];
  })[]).map((p) => ({ ...p, item_count: p.purchase_items?.[0]?.count ?? 0 }));

  const spendByMonth = new Map<string, number>();
  for (const p of purchases) {
    const key = p.purchased_at.slice(0, 7);
    spendByMonth.set(key, (spendByMonth.get(key) ?? 0) + Number(p.total));
  }

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const recentSpend = purchases
    .filter((p) => new Date(p.purchased_at) >= thisWeekStart)
    .reduce((s, p) => s + Number(p.total), 0);
  const avgWeeklySpend =
    purchases.length > 0
      ? purchases.reduce((s, p) => s + Number(p.total), 0) /
        Math.max(1, Math.ceil((Date.now() - new Date(purchases[0].purchased_at).getTime()) / (7 * 86400000)))
      : 0;

  return {
    purchases,
    spendByMonth: Array.from(spendByMonth.entries()).map(([month, total]) => ({ month, total })),
    mostPurchased: (byTimesRes.data ?? []) as Product[],
    topSpend: (bySpendRes.data ?? []) as Product[],
    recentSpend,
    avgWeeklySpend,
  };
}
