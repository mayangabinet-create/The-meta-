import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import ShoppingListView from "@/components/ShoppingListView";
import { getShoppingList, isSupabaseConfigured } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ShoppingListPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <PageHeader title="מה כדאי לקנות?" />
        <SetupNotice />
      </div>
    );
  }

  const products = await getShoppingList();

  return (
    <div>
      <PageHeader title="מה כדאי לקנות?" subtitle="מסודר לפי ציון קנייה" />
      <ShoppingListView products={products} />
    </div>
  );
}
