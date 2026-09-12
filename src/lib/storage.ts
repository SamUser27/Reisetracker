import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Lokale Bild-Ablage. Später beim Cloud-Umzug ist das der einzige Ort,
 * der auf einen Objekt-Storage-Client (z. B. Vercel Blob) umgestellt werden muss.
 */
export async function saveImage(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const rawExt = path.extname(file.name) || ".jpg";
  const ext = rawExt.toLowerCase();
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function deleteImage(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", publicPath);
  await unlink(filePath).catch(() => undefined);
}
