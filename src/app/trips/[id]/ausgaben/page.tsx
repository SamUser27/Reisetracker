import { notFound } from "next/navigation";
import { getTripById, getTripExpenses } from "@/lib/firestore-db";
import { calculateBalances, simplifyDebts } from "@/lib/settle-up";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  formatCurrency,
  formatDate,
  formatPeopleList,
} from "@/lib/labels";
import { Avatar } from "@/components/Avatar";
import { createExpense, deleteExpense } from "@/lib/actions/expenses";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function TripExpensesPage({
  params,
}: PageProps<"/trips/[id]/ausgaben">) {
  const { id } = await params;

  const [trip, expenses] = await Promise.all([
    getTripById(id),
    getTripExpenses(id),
  ]);

  if (!trip) notFound();

  const people = trip.participants.map((p) => p.person);
  const balances = calculateBalances(
    people,
    expenses.map((e) => ({
      payments: e.payments.map((p) => ({ personId: p.personId, paidAmount: p.paidAmount })),
      shares: e.shares.map((s) => ({ personId: s.personId, shareAmount: s.shareAmount })),
    })),
  );
  const debts = simplifyDebts(balances);
  const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);

  const createExpenseWithTrip = createExpense.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Ausgleich</h2>
          <span className="text-sm text-[var(--text-secondary)]">
            Gesamt: {formatCurrency(totalCost)}
          </span>
        </div>
        {debts.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            Alles ausgeglichen — niemand schuldet aktuell jemandem etwas.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {debts.map((debt) => (
              <li
                key={`${debt.fromId}-${debt.toId}`}
                className="flex items-center gap-2 text-sm"
              >
                <span className="badge" style={{ background: "var(--accent-terracotta-soft)", color: "var(--accent-terracotta)" }}>
                  {debt.fromName}
                </span>
                schuldet
                <span className="badge" style={{ background: "var(--accent-teal-soft)", color: "var(--accent-teal)" }}>
                  {debt.toName}
                </span>
                <span className="font-medium">{formatCurrency(debt.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="card p-6" open={expenses.length === 0}>
        <summary className="cursor-pointer font-serif text-xl">
          Ausgabe erfassen
        </summary>
        <form action={createExpenseWithTrip} className="flex flex-col gap-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Beschreibung
              <input name="description" required placeholder="z. B. Abendessen" className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Betrag (EUR)
              <input name="amount" type="number" step="0.01" min="0.01" required className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Datum
              <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Kategorie
              <select name="category" required className="input" defaultValue="SONSTIGES">
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {EXPENSE_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm mb-1">Bezahlt von</legend>
            <div className="flex flex-wrap gap-3">
              {people.map((person) => (
                <label key={person.id} className="flex items-center gap-2 panel px-3 py-2 cursor-pointer text-sm">
                  <input type="checkbox" name="paidByIds" value={person.id} />
                  <Avatar name={person.name} color={person.colorTag} size={24} />
                  {person.name}
                </label>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Mehrere auswählen, wenn beide bezahlt haben — der Betrag wird dann gleichmäßig aufgeteilt.
            </p>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm mb-1">Gilt für</legend>
            <div className="flex flex-wrap gap-3">
              {people.map((person) => (
                <label key={person.id} className="flex items-center gap-2 panel px-3 py-2 cursor-pointer text-sm">
                  <input type="checkbox" name="participantIds" value={person.id} defaultChecked />
                  <Avatar name={person.name} color={person.colorTag} size={24} />
                  {person.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <button type="submit" className="btn btn-primary">
              Ausgabe speichern
            </button>
          </div>
        </form>
      </details>

      <div className="card divide-y divide-[var(--border)]">
        {expenses.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            Noch keine Ausgaben erfasst.
          </p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="p-4 flex items-center gap-4">
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{expense.description}</span>
                  <span className="badge" style={{ background: "var(--surface-1)", color: "var(--text-secondary)" }}>
                    {EXPENSE_CATEGORY_LABELS[expense.category]}
                  </span>
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {formatDate(expense.date)} · bezahlt von{" "}
                  {formatPeopleList(expense.payments.map((p) => p.person.name))} · gilt für{" "}
                  {formatPeopleList(expense.shares.map((s) => s.person.name))}
                </span>
              </div>
              <span className="font-medium shrink-0">{formatCurrency(expense.amount)}</span>
              <form action={deleteExpense.bind(null, id, expense.id)}>
                <ConfirmSubmitButton
                  confirmMessage="Diese Ausgabe wirklich löschen?"
                  className="btn btn-ghost shrink-0"
                >
                  Löschen
                </ConfirmSubmitButton>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
