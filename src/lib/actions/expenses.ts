"use server";

import { revalidatePath } from "next/cache";
import { createExpenseDoc, deleteExpenseDoc } from "@/lib/firestore-db";
import { splitEqually } from "@/lib/settle-up";

export async function createExpense(tripId: string, formData: FormData) {
  const date = new Date(String(formData.get("date")));
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category"));
  const paidByIds = formData.getAll("paidByIds").map(String);
  const participantIds = formData.getAll("participantIds").map(String);

  if (!description || !Number.isFinite(amount) || amount <= 0) return;
  if (paidByIds.length === 0 || participantIds.length === 0) return;

  const payments = splitEqually(amount, paidByIds).map((p) => ({
    personId: p.personId,
    paidAmount: p.amount,
  }));

  const shares = splitEqually(amount, participantIds).map((p) => ({
    personId: p.personId,
    shareAmount: p.amount,
  }));

  await createExpenseDoc(tripId, {
    date,
    description,
    amount,
    category,
    payments,
    shares,
  });

  revalidatePath(`/trips/${tripId}/ausgaben`);
  revalidatePath(`/trips/${tripId}`);
}

export async function deleteExpense(tripId: string, expenseId: string) {
  await deleteExpenseDoc(tripId, expenseId);
  revalidatePath(`/trips/${tripId}/ausgaben`);
  revalidatePath(`/trips/${tripId}`);
}
