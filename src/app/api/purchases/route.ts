import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { DraftItem } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    purchased_at?: string;
    store?: string | null;
    items?: DraftItem[];
  };

  const items = (body.items ?? []).filter(
    (item) => item.name && item.name.trim().length > 0
  );

  if (items.length === 0) {
    return NextResponse.json(
      { error: "הקנייה חייבת לכלול לפחות מוצר אחד." },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase.rpc("apply_purchase", {
    p_purchased_at: body.purchased_at || new Date().toISOString().slice(0, 10),
    p_store: body.store || null,
    p_items: items.map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity || 1,
      price: item.price || 0,
      category: item.category || null,
    })),
  });

  if (error) {
    console.error("apply_purchase failed", error);
    return NextResponse.json({ error: "שמירת הקנייה נכשלה." }, { status: 500 });
  }

  return NextResponse.json({ id: data as string }, { status: 201 });
}
