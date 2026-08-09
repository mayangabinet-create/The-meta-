# אפליקציה דידי — Smart Shopping Tracker

מערכת מעקב קניות חכמה: כל קבלה שסורקים מעדכנת "ציון קנייה" (0–10) לכל מוצר,
ולפני הקנייה הבאה האפליקציה בונה רשימת קניות מומלצת לפי מה שבאמת קונים שוב
ושוב. המערכת לא מוגבלת לסוג מוצר מסוים — כל שורה בקבלה יכולה להפוך לחלק
מהמערכת.

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind CSS 4
- **Supabase** (Postgres) — כל הגישה למסד הנתונים מתבצעת בצד השרת בלבד
  (service-role key), כך שאין צורך בהתחברות/הרשאות בצד הלקוח
- **Claude API** (Vision) — זיהוי מוצרים, כמויות ומחירים מתמונת קבלה

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # ומילוי הערכים, ראו למטה
npm run dev
```

## הגדרת סביבה

1. **Supabase** — צרו פרויקט ב-[supabase.com](https://supabase.com/dashboard),
   והריצו את המיגרציה ב-`supabase/migrations/0001_init.sql` (דרך ה-SQL
   Editor בדשבורד, או `supabase db push`). מלאו ב-`.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role)
2. **Anthropic** — מפתח API מ-[console.anthropic.com](https://console.anthropic.com)
   בתוך `ANTHROPIC_API_KEY`, לשימוש בסריקת קבלות.

בלי ההגדרות האלה האפליקציה תרוץ אבל תציג הודעת "Supabase עוד לא מחובר"
במקום נתונים.

## מבנה

- `src/app` — המסכים (בית / רשימה / סטטיסטיקות / היסטוריה / הוספת קנייה)
  ונקודות ה-API (`scan-receipt`, `purchases`)
- `src/lib/queries.ts` — כל שאילתות הקריאה מול Supabase (server-only)
- `supabase/migrations` — סכימת מסד הנתונים + פונקציית `apply_purchase`
  שמיישמת את מערכת הציונים (+1 למוצר שנקנה, ‑1 לכל מוצר קיים שלא נקנה,
  בטווח 0–10) בטרנזקציה אחת
