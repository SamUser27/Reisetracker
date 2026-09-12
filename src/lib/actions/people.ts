"use server";

import { revalidatePath } from "next/cache";
import { createPerson } from "@/lib/firestore-db";

export async function createPersonAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await createPerson(name);

  revalidatePath("/", "layout");
}
