import { db } from "@/lib/firestore";
import { pickPersonColor } from "@/lib/labels";

export interface PersonDoc {
  id: string;
  name: string;
  colorTag: string;
  createdAt: string;
}

export interface TripParticipantData {
  personId: string;
  person: PersonDoc;
}

export interface ExpensePaymentData {
  personId: string;
  paidAmount: number;
  person?: PersonDoc;
}

export interface ExpenseShareData {
  personId: string;
  shareAmount: number;
  person?: PersonDoc;
}

export interface ExpenseDoc {
  id: string;
  tripId: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  category: string;
  createdAt: string;
  payments: { personId: string; paidAmount: number; person: PersonDoc }[];
  shares: { personId: string; shareAmount: number; person: PersonDoc }[];
}

export interface TripDoc {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImagePath: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  participantIds: string[];
  participants: { personId: string; person: PersonDoc }[];
  expenses: { id: string; amount: number }[];
}

export interface PlanDayDoc {
  id: string;
  tripId: string;
  date: Date;
  accommodationName: string | null;
  accommodationNote: string | null;
  activities: string | null;
}

export interface InfoItemDoc {
  id: string;
  tripId: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
}

// Helper zum Konvertieren von Firestore Timestamps/Strings in Date
function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate();
  }
  if (typeof val === "string" || typeof val === "number") {
    return new Date(val);
  }
  return new Date();
}

// --- PEOPLE ---
export async function getPeople(): Promise<PersonDoc[]> {
  try {
    const snapshot = await db.collection("people").orderBy("createdAt", "asc").get();
    if (snapshot.empty) {
      // Direkter Batch-Seed ohne rekursiven getPeople-Aufruf
      const p1Ref = db.collection("people").doc();
      const p2Ref = db.collection("people").doc();
      const now = new Date().toISOString();
      const p1: PersonDoc = { id: p1Ref.id, name: "Samu", colorTag: pickPersonColor(0), createdAt: now };
      const p2: PersonDoc = { id: p2Ref.id, name: "Luisa", colorTag: pickPersonColor(1), createdAt: now };

      const batch = db.batch();
      batch.set(p1Ref, p1);
      batch.set(p2Ref, p2);
      await batch.commit();

      return [p1, p2];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? "",
        colorTag: data.colorTag ?? "#3b82f6",
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("Error in getPeople():", err);
    return [
      { id: "p1", name: "Samu", colorTag: "#c05a34", createdAt: new Date().toISOString() },
      { id: "p2", name: "Luisa", colorTag: "#2f6f6a", createdAt: new Date().toISOString() },
    ];
  }
}

export async function createPerson(name: string): Promise<PersonDoc> {
  const people = await getPeople();
  const colorTag = pickPersonColor(people.length);
  const docRef = db.collection("people").doc();
  const person: PersonDoc = {
    id: docRef.id,
    name,
    colorTag,
    createdAt: new Date().toISOString(),
  };
  await docRef.set(person);
  return person;
}

// --- TRIPS ---
export async function getTrips(): Promise<TripDoc[]> {
  try {
    const [peopleList, tripsSnapshot] = await Promise.all([
      getPeople(),
      db.collection("trips").get(),
    ]);

    const peopleMap = new Map(peopleList.map((p) => [p.id, p]));

    const trips = await Promise.all(
      tripsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const participantIds: string[] = data.participantIds ?? [];
        const participants = participantIds
          .map((pId) => peopleMap.get(pId))
          .filter((p): p is PersonDoc => Boolean(p))
          .map((p) => ({ personId: p.id, person: p }));

        // Fetch expenses minimal
        const expensesSnapshot = await db
          .collection("trips")
          .doc(doc.id)
          .collection("expenses")
          .get();

        const expenses = expensesSnapshot.docs.map((eDoc) => ({
          id: eDoc.id,
          amount: Number(eDoc.data().amount ?? 0),
        }));

        return {
          id: doc.id,
          title: data.title ?? "",
          destination: data.destination ?? "",
          startDate: toDate(data.startDate),
          endDate: toDate(data.endDate),
          coverImagePath: data.coverImagePath ?? null,
          notes: data.notes ?? null,
          createdAt: data.createdAt ?? new Date().toISOString(),
          updatedAt: data.updatedAt ?? new Date().toISOString(),
          participantIds,
          participants,
          expenses,
        };
      })
    );

    return trips.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  } catch (err) {
    console.error("Error in getTrips():", err);
    return [];
  }
}

export async function getTripById(tripId: string): Promise<TripDoc | null> {
  try {
    const [doc, peopleList] = await Promise.all([
      db.collection("trips").doc(tripId).get(),
      getPeople(),
    ]);

    if (!doc.exists) return null;
    const data = doc.data()!;
    const peopleMap = new Map(peopleList.map((p) => [p.id, p]));

    const participantIds: string[] = data.participantIds ?? [];
    const participants = participantIds
      .map((pId) => peopleMap.get(pId))
      .filter((p): p is PersonDoc => Boolean(p))
      .map((p) => ({ personId: p.id, person: p }));

    const expensesSnapshot = await db
      .collection("trips")
      .doc(tripId)
      .collection("expenses")
      .get();

    const expenses = expensesSnapshot.docs.map((eDoc) => ({
      id: eDoc.id,
      amount: Number(eDoc.data().amount ?? 0),
    }));

    return {
      id: doc.id,
      title: data.title ?? "",
      destination: data.destination ?? "",
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      coverImagePath: data.coverImagePath ?? null,
      notes: data.notes ?? null,
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      participantIds,
      participants,
      expenses,
    };
  } catch (err) {
    console.error(`Error in getTripById(${tripId}):`, err);
    return null;
  }
}

export async function createTripDoc(data: {
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  coverImagePath: string | null;
  participantIds: string[];
}): Promise<string> {
  const docRef = db.collection("trips").doc();
  const now = new Date().toISOString();

  await docRef.set({
    title: data.title,
    destination: data.destination,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    notes: data.notes,
    coverImagePath: data.coverImagePath,
    participantIds: data.participantIds,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function updateTripDoc(
  tripId: string,
  data: {
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    notes: string | null;
    coverImagePath: string | null;
    participantIds: string[];
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .collection("trips")
    .doc(tripId)
    .update({
      title: data.title,
      destination: data.destination,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      notes: data.notes,
      coverImagePath: data.coverImagePath,
      participantIds: data.participantIds,
      updatedAt: now,
    });
}

export async function deleteTripDoc(tripId: string): Promise<void> {
  const tripRef = db.collection("trips").doc(tripId);

  // Delete subcollections
  const subcollections = ["expenses", "planDays", "infoItems"];
  for (const sub of subcollections) {
    const subSnap = await tripRef.collection(sub).get();
    const batch = db.batch();
    subSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  await tripRef.delete();
}

// --- EXPENSES ---
export async function getTripExpenses(tripId: string): Promise<ExpenseDoc[]> {
  try {
    const [peopleList, expensesSnap] = await Promise.all([
      getPeople(),
      db.collection("trips").doc(tripId).collection("expenses").get(),
    ]);

    const peopleMap = new Map(peopleList.map((p) => [p.id, p]));

    const expenses = expensesSnap.docs.map((doc) => {
      const data = doc.data();

      const rawPayments: { personId: string; paidAmount: number }[] =
        data.payments ?? [];
      const payments = rawPayments.map((p) => ({
        personId: p.personId,
        paidAmount: p.paidAmount,
        person: peopleMap.get(p.personId)!,
      })).filter((p) => Boolean(p.person));

      const rawShares: { personId: string; shareAmount: number }[] =
        data.shares ?? [];
      const shares = rawShares.map((s) => ({
        personId: s.personId,
        shareAmount: s.shareAmount,
        person: peopleMap.get(s.personId)!,
      })).filter((s) => Boolean(s.person));

      return {
        id: doc.id,
        tripId,
        date: toDate(data.date),
        description: data.description ?? "",
        amount: Number(data.amount ?? 0),
        currency: data.currency ?? "EUR",
        category: data.category ?? "SONSTIGES",
        createdAt: data.createdAt ?? new Date().toISOString(),
        payments,
        shares,
      };
    });

    return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {
    console.error(`Error in getTripExpenses(${tripId}):`, err);
    return [];
  }
}

export async function createExpenseDoc(
  tripId: string,
  data: {
    date: Date;
    description: string;
    amount: number;
    category: string;
    payments: { personId: string; paidAmount: number }[];
    shares: { personId: string; shareAmount: number }[];
  }
): Promise<string> {
  const docRef = db.collection("trips").doc(tripId).collection("expenses").doc();
  await docRef.set({
    tripId,
    date: data.date.toISOString(),
    description: data.description,
    amount: data.amount,
    category: data.category,
    currency: "EUR",
    payments: data.payments,
    shares: data.shares,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function deleteExpenseDoc(
  tripId: string,
  expenseId: string
): Promise<void> {
  await db
    .collection("trips")
    .doc(tripId)
    .collection("expenses")
    .doc(expenseId)
    .delete();
}

// --- PLAN DAYS ---
export async function getTripPlanDays(tripId: string): Promise<PlanDayDoc[]> {
  try {
    const snap = await db
      .collection("trips")
      .doc(tripId)
      .collection("planDays")
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        tripId,
        date: toDate(data.date),
        accommodationName: data.accommodationName ?? null,
        accommodationNote: data.accommodationNote ?? null,
        activities: data.activities ?? null,
      };
    });
  } catch (err) {
    console.error(`Error in getTripPlanDays(${tripId}):`, err);
    return [];
  }
}

export async function savePlanDayDoc(
  tripId: string,
  data: {
    date: Date;
    accommodationName: string | null;
    accommodationNote: string | null;
    activities: string | null;
  }
): Promise<void> {
  const dateKey = data.date.toISOString().slice(0, 10);
  const docRef = db
    .collection("trips")
    .doc(tripId)
    .collection("planDays")
    .doc(dateKey);

  await docRef.set(
    {
      tripId,
      date: data.date.toISOString(),
      accommodationName: data.accommodationName,
      accommodationNote: data.accommodationNote,
      activities: data.activities,
    },
    { merge: true }
  );
}

// --- INFO ITEMS ---
export async function getTripInfoItems(tripId: string): Promise<InfoItemDoc[]> {
  try {
    const snap = await db
      .collection("trips")
      .doc(tripId)
      .collection("infoItems")
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        tripId,
        category: data.category ?? "SONSTIGES",
        title: data.title ?? "",
        content: data.content ?? "",
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
    });

    return items.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (err) {
    console.error(`Error in getTripInfoItems(${tripId}):`, err);
    return [];
  }
}

export async function createInfoItemDoc(
  tripId: string,
  data: { category: string; title: string; content: string }
): Promise<string> {
  const docRef = db
    .collection("trips")
    .doc(tripId)
    .collection("infoItems")
    .doc();

  await docRef.set({
    tripId,
    category: data.category,
    title: data.title,
    content: data.content,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function deleteInfoItemDoc(
  tripId: string,
  infoItemId: string
): Promise<void> {
  await db
    .collection("trips")
    .doc(tripId)
    .collection("infoItems")
    .doc(infoItemId)
    .delete();
}
