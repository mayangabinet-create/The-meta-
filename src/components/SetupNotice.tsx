import { AlertTriangle } from "lucide-react";

export default function SetupNotice() {
  return (
    <div className="mx-5 mt-6 flex items-start gap-3 rounded-2xl border border-tier-medium/30 bg-tier-medium/10 p-4 text-sm">
      <AlertTriangle size={20} className="mt-0.5 shrink-0 text-tier-medium" />
      <div>
        <p className="font-semibold text-tier-medium">Supabase עוד לא מחובר</p>
        <p className="mt-1 text-muted">
          יש להגדיר את המשתנים <code className="text-foreground">SUPABASE_URL</code> ו-
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> (ראו{" "}
          <code className="text-foreground">.env.example</code>) כדי לראות נתונים אמיתיים.
        </p>
      </div>
    </div>
  );
}
