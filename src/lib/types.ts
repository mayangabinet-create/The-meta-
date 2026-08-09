export type Product = {
  id: string;
  name: string;
  category: string | null;
  priority_score: number;
  times_purchased: number;
  total_spent: number;
  last_purchased_at: string | null;
  created_at: string;
};

export type Purchase = {
  id: string;
  purchased_at: string;
  store: string | null;
  total: number;
  created_at: string;
};

export type PurchaseItem = {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type PurchaseWithItemCount = Purchase & { item_count: number };

export type PurchaseWithItems = Purchase & { items: PurchaseItem[] };

/** A single line item as extracted from a receipt, before it's saved. */
export type DraftItem = {
  name: string;
  quantity: number;
  price: number;
  category?: string | null;
};

export type ScannedReceipt = {
  items: DraftItem[];
  store: string | null;
  purchased_at: string | null;
  total: number | null;
};

export const CATEGORIES = [
  "חטיפים",
  "שתייה",
  "אוכל",
  "בית",
  "טיפוח",
  "אחר",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function priorityTier(score: number): "high" | "medium" | "low" {
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}
