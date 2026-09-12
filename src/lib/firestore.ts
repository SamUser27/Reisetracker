import { initializeApp, getApps, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount(): ServiceAccount | null {
  // Option 1: Volle JSON in einer Variable (FIREBASE_SERVICE_ACCOUNT)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, "\n"),
        };
      }
    } catch {
      // ignore
    }
  }

  // Option 2: Einzelne Variablen
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["']|["']$/g, "");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, "");
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, "");

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  return null;
}

if (!getApps().length) {
  const sa = getServiceAccount();
  if (sa) {
    try {
      initializeApp({
        credential: cert(sa),
      });
    } catch (err) {
      console.error("[Firebase Admin] Failed to initialize with cert:", err);
      initializeApp({ projectId: sa.projectId || "reisetracker-97e00" });
    }
  } else {
    console.error("[Firebase Admin] Credentials missing from env vars.");
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "reisetracker-97e00" });
  }
}

export const db = getFirestore();
