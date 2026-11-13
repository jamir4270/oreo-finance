import { createClient, getAuthUser } from "@/lib/supabase/server";
import { csvRow } from "@/lib/csv";
import { getToday } from "@/lib/today";

export const dynamic = "force-dynamic";

const PAGE = 1000; // PostgREST's default max rows per request

type Row = {
  txn_date: string;
  type: string;
  amount: number;
  to_amount: number | null;
  exchange_rate: number | null;
  original_amount: number | null;
  original_currency: string | null;
  note: string | null;
  account: { name: string; currency: string } | null;
  to_account: { name: string; currency: string } | null;
  category: { name: string } | null;
};

/** All of the signed-in user's transactions as CSV (RLS scopes the query to them). */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const supabase = await createClient();

  // shortcut: builds the file in memory; stream it if exports grow past ~100k rows.
  let csv = csvRow([
    "Date", "Type", "Amount", "Currency", "Account", "Category", "Note",
    "To account", "To amount", "To currency", "Exchange rate", "Original amount", "Original currency",
  ]);

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        txn_date, type, amount, to_amount, exchange_rate, original_amount, original_currency, note,
        account:accounts!transactions_account_id_fkey (name, currency),
        to_account:accounts!transactions_to_account_id_fkey (name, currency),
        category:categories (name)
      `)
      .eq("user_id", user.id)
      .order("txn_date", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }) // stable paging when dates and timestamps tie
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("CSV export failed:", error);
      return new Response("Export failed. Please try again.", { status: 500 });
    }

    for (const t of (data || []) as unknown as Row[]) {
      csv += csvRow([
        t.txn_date,
        t.type,
        Number(t.amount),
        t.account?.currency,
        t.account?.name,
        t.category?.name,
        t.note,
        t.to_account?.name,
        t.to_amount === null ? null : Number(t.to_amount),
        t.to_account?.currency,
        t.exchange_rate === null ? null : Number(t.exchange_rate),
        t.original_amount === null ? null : Number(t.original_amount),
        t.original_currency,
      ]);
    }
    if (!data || data.length < PAGE) break;
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="oreo-transactions-${await getToday()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
