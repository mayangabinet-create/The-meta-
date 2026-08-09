"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Pencil, Plus, Trash2, Loader2, Check } from "lucide-react";
import Card from "@/components/Card";
import { formatCurrency } from "@/lib/format";
import type { DraftItem } from "@/lib/types";

type Stage = "choose" | "scanning" | "confirm";

function emptyItem(): DraftItem {
  return { name: "", quantity: 1, price: 0 };
}

export default function AddPurchaseFlow() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("choose");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [store, setStore] = useState("");
  const [purchasedAt, setPurchasedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setStage("scanning");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/scan-receipt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה בסריקה");

      setItems(data.items.length > 0 ? data.items : [emptyItem()]);
      setStore(data.store ?? "");
      setPurchasedAt(data.purchased_at ?? new Date().toISOString().slice(0, 10));
      setStage("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בסריקה");
      setStage("choose");
    }
  }

  function startManual() {
    setItems([emptyItem()]);
    setStore("");
    setPurchasedAt(new Date().toISOString().slice(0, 10));
    setError(null);
    setStage("confirm");
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  async function handleSave() {
    setError(null);
    const validItems = items.filter((item) => item.name.trim().length > 0);
    if (validItems.length === 0) {
      setError("צריך לפחות מוצר אחד עם שם.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased_at: purchasedAt, store: store || null, items: validItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שמירת הקנייה נכשלה");
      router.push(`/history/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת הקנייה נכשלה");
      setSaving(false);
    }
  }

  if (stage === "choose") {
    return (
      <div className="space-y-4 px-5 pb-4">
        {error && (
          <Card className="border-danger/30 bg-danger/10 text-sm text-danger">{error}</Card>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 py-10 text-accent"
        >
          <Camera size={36} />
          <span className="text-lg font-semibold">📷 סרוק קבלה</span>
        </button>
        <button
          onClick={startManual}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-10 text-foreground"
        >
          <Pencil size={32} />
          <span className="text-lg font-semibold">✏️ הוסף ידנית</span>
        </button>
      </div>
    );
  }

  if (stage === "scanning") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-5 py-24 text-center">
        <Loader2 size={36} className="animate-spin text-accent" />
        <p className="text-muted">סורק את הקבלה...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 pb-4">
      <h2 className="text-sm font-semibold text-muted">בדוק את הקנייה</h2>

      {error && <Card className="border-danger/30 bg-danger/10 text-sm text-danger">{error}</Card>}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted">תאריך</label>
          <input
            type="date"
            value={purchasedAt}
            onChange={(e) => setPurchasedAt(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted">חנות (לא חובה)</label>
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="שם החנות"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      <Card className="space-y-3 p-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
              placeholder="שם מוצר"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
            />
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={item.quantity}
              onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
              className="w-14 rounded-lg border border-border bg-surface-2 px-2 py-2 text-center text-sm"
            />
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={item.price}
              onChange={(e) => updateItem(index, { price: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border bg-surface-2 px-2 py-2 text-center text-sm"
            />
            <button
              onClick={() => removeItem(index)}
              aria-label="מחק מוצר"
              className="shrink-0 text-muted hover:text-danger"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted"
        >
          <Plus size={16} /> הוסף מוצר
        </button>
      </Card>

      <Card className="flex items-center justify-between">
        <span className="font-semibold text-muted">סה&quot;כ</span>
        <span className="text-xl font-extrabold">{formatCurrency(total)}</span>
      </Card>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-lg font-semibold text-background disabled:opacity-60"
      >
        {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
        שמור קנייה
      </button>
    </div>
  );
}
