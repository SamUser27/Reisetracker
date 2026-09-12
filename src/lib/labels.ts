export type ExpenseCategory =
  | "SOUVENIRS"
  | "KLEIDUNG"
  | "ESSEN"
  | "TRANSPORT"
  | "UNTERKUNFT"
  | "EINTRITTE"
  | "SONSTIGES";

export type InfoCategory = "GEPAECK" | "NOTFALL" | "DOKUMENTE" | "SONSTIGES";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  SOUVENIRS: "Souvenirs",
  KLEIDUNG: "Kleidung",
  ESSEN: "Essen",
  TRANSPORT: "Transport",
  UNTERKUNFT: "Unterkunft",
  EINTRITTE: "Eintritte",
  SONSTIGES: "Sonstiges",
};

export const EXPENSE_CATEGORIES = Object.keys(
  EXPENSE_CATEGORY_LABELS,
) as ExpenseCategory[];

export const INFO_CATEGORY_LABELS: Record<InfoCategory, string> = {
  GEPAECK: "Gepäck",
  NOTFALL: "Notfall",
  DOKUMENTE: "Dokumente",
  SONSTIGES: "Sonstiges",
};

export const INFO_CATEGORIES = Object.keys(
  INFO_CATEGORY_LABELS,
) as InfoCategory[];

const PERSON_COLOR_PALETTE = [
  "#c05a34",
  "#2f6f6a",
  "#b8862f",
  "#6a5a8c",
  "#3f7d4f",
  "#a13a3a",
  "#4a6f8c",
];

export function pickPersonColor(existingCount: number): string {
  return PERSON_COLOR_PALETTE[existingCount % PERSON_COLOR_PALETTE.length];
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateRange(start: Date, end: Date): string {
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startFmt = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: sameMonth ? undefined : "long",
  }).format(start);
  const endFmt = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(end);
  return `${startFmt}. – ${endFmt}`;
}

export function tripDurationDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

/** "Samu" / "Samu & Luisa" / "Samu, Luisa & Max" */
export function formatPeopleList(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}
