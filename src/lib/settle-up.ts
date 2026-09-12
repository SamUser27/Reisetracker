export interface PersonRef {
  id: string;
  name: string;
}

export interface ExpenseForSettlement {
  payments: { personId: string; paidAmount: number }[];
  shares: { personId: string; shareAmount: number }[];
}

export interface Balance {
  personId: string;
  personName: string;
  /** Positiv: bekommt Geld zurück. Negativ: schuldet noch Geld. */
  net: number;
}

export interface Debt {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** Verteilt einen Betrag gleichmäßig auf mehrere Personen (Cent-Rest geht an die ersten). */
export function splitEqually(
  amount: number,
  participantIds: string[],
): { personId: string; amount: number }[] {
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / participantIds.length);
  const remainder = cents - base * participantIds.length;

  return participantIds.map((personId, index) => ({
    personId,
    amount: (base + (index < remainder ? 1 : 0)) / 100,
  }));
}

export function calculateBalances(
  participants: PersonRef[],
  expenses: ExpenseForSettlement[],
): Balance[] {
  const net = new Map<string, number>();
  for (const person of participants) net.set(person.id, 0);

  for (const expense of expenses) {
    for (const payment of expense.payments) {
      net.set(payment.personId, (net.get(payment.personId) ?? 0) + payment.paidAmount);
    }
    for (const share of expense.shares) {
      net.set(share.personId, (net.get(share.personId) ?? 0) - share.shareAmount);
    }
  }

  return participants.map((person) => ({
    personId: person.id,
    personName: person.name,
    net: round2(net.get(person.id) ?? 0),
  }));
}

/** Greedy Ausgleich (wie bei Splitwise): reduziert alle Salden auf eine minimale Liste an Überweisungen. */
export function simplifyDebts(balances: Balance[]): Debt[] {
  const creditors = balances
    .filter((b) => b.net > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter((b) => b.net < -0.005)
    .map((b) => ({ ...b, net: -b.net }))
    .sort((a, b) => b.net - a.net);

  const debts: Debt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = round2(Math.min(debtor.net, creditor.net));

    if (amount > 0.005) {
      debts.push({
        fromId: debtor.personId,
        fromName: debtor.personName,
        toId: creditor.personId,
        toName: creditor.personName,
        amount,
      });
    }

    debtor.net = round2(debtor.net - amount);
    creditor.net = round2(creditor.net - amount);

    if (debtor.net <= 0.005) i++;
    if (creditor.net <= 0.005) j++;
  }

  return debts;
}
