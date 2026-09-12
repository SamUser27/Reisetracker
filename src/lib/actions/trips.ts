"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTripDoc,
  deleteTripDoc,
  getTripById,
  updateTripDoc,
} from "@/lib/firestore-db";

function parseTripFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const participantIds = formData.getAll("participantIds").map(String);
  const coverImageUrl =
    String(formData.get("coverImageUrl") ?? formData.get("coverImagePath") ?? "").trim() || null;

  return {
    title,
    destination,
    startDate,
    endDate,
    notes,
    participantIds,
    coverImageUrl,
  };
}

export async function createTrip(formData: FormData) {
  const {
    title,
    destination,
    startDate,
    endDate,
    notes,
    participantIds,
    coverImageUrl,
  } = parseTripFields(formData);

  if (!title || !destination || participantIds.length === 0) return;

  const tripId = await createTripDoc({
    title,
    destination,
    startDate,
    endDate,
    notes,
    coverImagePath: coverImageUrl,
    participantIds,
  });

  revalidatePath("/");
  redirect(`/trips/${tripId}`);
}

export async function updateTrip(tripId: string, formData: FormData) {
  const {
    title,
    destination,
    startDate,
    endDate,
    notes,
    participantIds,
    coverImageUrl,
  } = parseTripFields(formData);

  if (!title || !destination || participantIds.length === 0) return;

  const existing = await getTripById(tripId);
  if (!existing) return;

  const finalCoverImage =
    coverImageUrl !== null ? coverImageUrl : existing.coverImagePath;

  await updateTripDoc(tripId, {
    title,
    destination,
    startDate,
    endDate,
    notes,
    coverImagePath: finalCoverImage,
    participantIds,
  });

  revalidatePath("/");
  revalidatePath(`/trips/${tripId}`, "layout");
  redirect(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string) {
  await deleteTripDoc(tripId);
  revalidatePath("/");
  redirect("/");
}
