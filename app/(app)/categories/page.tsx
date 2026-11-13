import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CategoriesPageClient } from "@/components/categories/CategoriesPageClient";

export default async function CategoriesPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();

  // Fetch user's categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, txn_type, icon, is_default")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <CategoriesPageClient 
        categories={categories || []} 
      />
    </div>
  );
}
