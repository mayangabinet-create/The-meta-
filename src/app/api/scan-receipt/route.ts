import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ScannedReceipt } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "extract_receipt",
  description: "Structured data extracted from a shopping receipt photo.",
  input_schema: {
    type: "object",
    properties: {
      store: {
        type: ["string", "null"],
        description: "Store/chain name if visible, otherwise null.",
      },
      purchased_at: {
        type: ["string", "null"],
        description: "Purchase date in YYYY-MM-DD format if visible, otherwise null.",
      },
      total: {
        type: ["number", "null"],
        description: "Total amount charged, if visible.",
      },
      items: {
        type: "array",
        description: "Every product line on the receipt.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Product name, cleaned up but in its original language." },
            quantity: { type: "number", description: "Quantity purchased, default 1." },
            price: { type: "number", description: "Total price for this line (not unit price)." },
          },
          required: ["name", "quantity", "price"],
        },
      },
    },
    required: ["items"],
  },
};

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const file = form.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'image' file." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mediaType = file.type || "image/jpeg";

  if (bytes.byteLength > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 20MB)." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "extract_receipt" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: bytes.toString("base64"),
              },
            },
            {
              type: "text",
              text:
                "זו תמונה של קבלת קניות. חלץ את כל המוצרים, הכמויות והמחירים, " +
                "וכן את שם החנות, תאריך הקנייה והסכום הכולל אם ניתן לזהות אותם. " +
                "אם שדה לא ברור, החזר null עבורו במקום לנחש.",
            },
          ],
        },
      ],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      return NextResponse.json(
        { error: "לא הצלחנו לזהות פריטים בקבלה. נסה שוב או הוסף ידנית." },
        { status: 422 }
      );
    }

    const parsed = toolUse.input as {
      store: string | null;
      purchased_at: string | null;
      total: number | null;
      items: { name: string; quantity: number; price: number }[];
    };

    const result: ScannedReceipt = {
      store: parsed.store ?? null,
      purchased_at: parsed.purchased_at ?? null,
      total: parsed.total ?? null,
      items: (parsed.items ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
      })),
    };

    if (result.items.length === 0) {
      return NextResponse.json(
        { error: "לא נמצאו מוצרים בקבלה. אפשר להוסיף ידנית." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("scan-receipt failed", err);
    return NextResponse.json(
      { error: "שגיאה בסריקת הקבלה. נסה שוב." },
      { status: 502 }
    );
  }
}
