import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import StatsView from "@/components/StatsView";
import { getStats, isSupabaseConfigured } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <PageHeader title="סטטיסטיקות" />
        <SetupNotice />
      </div>
    );
  }

  const stats = await getStats();

  return (
    <div>
      <PageHeader title="סטטיסטיקות" />
      <StatsView {...stats} />
    </div>
  );
}
