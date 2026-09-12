import { notFound } from "next/navigation";
import { getTripById, getTripExpenses } from "@/lib/firestore-db";
import { EXPENSE_CATEGORY_LABELS, formatCurrency } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TripOverviewPage({
  params,
}: PageProps<"/trips/[id]">) {
  const { id } = await params;

  const [trip, expenses] = await Promise.all([
    getTripById(id),
    getTripExpenses(id),
  ]);

  if (!trip) notFound();

  const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = new Map<string, number>();
  for (const expense of expenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount,
    );
  }
  const categoryRows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 flex flex-col gap-6">
        {trip.notes && (
          <div className="card p-6">
            <h2 className="font-serif text-xl mb-2">Notizen</h2>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
              {trip.notes}
            </p>
          </div>
        )}

        <div className="card p-6">
          <h2 className="font-serif text-xl mb-4">Ausgaben nach Kategorie</h2>
          {categoryRows.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              Noch keine Ausgaben erfasst.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {categoryRows.map(([category, amount]) => (
                <div key={category} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {EXPENSE_CATEGORY_LABELS[
                        category as keyof typeof EXPENSE_CATEGORY_LABELS
                      ]}
                    </span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-1)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${totalCost ? (amount / totalCost) * 100 : 0}%`,
                        background: "var(--accent-terracotta)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 flex flex-col gap-1 h-fit">
        <span className="text-sm text-[var(--text-secondary)]">
          Gesamtkosten
        </span>
        <span className="font-serif text-3xl">{formatCurrency(totalCost)}</span>
      </div>
    </div>
  );
}
