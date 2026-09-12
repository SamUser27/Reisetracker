"use server";

import { revalidatePath } from "next/cache";
import { savePlanDayDoc } from "@/lib/firestore-db";

export async function savePlanDay(tripId: string, formData: FormData) {
  const date = new Date(String(formData.get("date")));
  const accommodationName = String(formData.get("accommodationName") ?? "").trim() || null;
  const accommodationNote = String(formData.get("accommodationNote") ?? "").trim() || null;
  const activities = String(formData.get("activities") ?? "").trim() || null;

  await savePlanDayDoc(tripId, {
    date,
    accommodationName,
    accommodationNote,
    activities,
  });

  revalidatePath(`/trips/${tripId}/planung`);
}
