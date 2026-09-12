"use server";

import { revalidatePath } from "next/cache";
import { createInfoItemDoc, deleteInfoItemDoc } from "@/lib/firestore-db";

export async function createInfoItem(tripId: string, formData: FormData) {
  const category = String(formData.get("category"));
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) return;

  await createInfoItemDoc(tripId, { category, title, content });

  revalidatePath(`/trips/${tripId}/infos`);
}

export async function deleteInfoItem(tripId: string, infoItemId: string) {
  await deleteInfoItemDoc(tripId, infoItemId);
  revalidatePath(`/trips/${tripId}/infos`);
}
