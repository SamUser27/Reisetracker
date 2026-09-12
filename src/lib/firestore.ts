import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/^["']|["']$/g, "");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/^["']|["']$/g, "");
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^["']|["']$/g, "");

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    try {
      initializeApp();
    } catch (e) {
      console.error("Failed to initialize Firebase Admin without cert:", e);
    }
  }
}

export const db = getFirestore();
