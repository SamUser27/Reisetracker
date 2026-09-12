import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["']|["']$/g, "");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, "");
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, "");

  if (privateKey) {
    // Falls Vercel echte Zeilenumbrüche oder escapte \n enthält
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (err) {
      console.error("Firebase cert init error:", err);
      initializeApp({ projectId });
    }
  } else {
    console.error("Missing Firebase credentials env vars:", {
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey),
    });
    initializeApp({ projectId: projectId || "reisetracker-97e00" });
  }
}

export const db = getFirestore();
