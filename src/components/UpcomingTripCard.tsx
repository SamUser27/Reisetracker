import Link from "next/link";
import { AvatarStack } from "@/components/Avatar";
import {
  formatCurrency,
  formatDateRange,
  tripDurationDays,
} from "@/lib/labels";

export interface UpcomingTripData {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalCost: number;
  participants: { id: string; name: string; colorTag: string }[];
}

export function UpcomingTripCard({ trip }: { trip: UpcomingTripData }) {
  const days = tripDurationDays(trip.startDate, trip.endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  start.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const timeLabel =
    diffDays > 0
      ? `in ${diffDays} ${diffDays === 1 ? "Tag" : "Tagen"}`
      : diffDays === 0
      ? "Startet heute!"
      : "Aktiv";

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card p-5 flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-transform border-l-4 border-l-[var(--accent-terracotta)]"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="badge font-medium"
            style={{
              background: "var(--accent-terracotta-soft)",
              color: "var(--accent-terracotta)",
            }}
          >
            📍 {trip.destination}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-1)] text-[var(--text-secondary)]">
            {timeLabel}
          </span>
        </div>
        <h3 className="font-serif text-xl leading-snug mt-1">{trip.title}</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {formatDateRange(trip.startDate, trip.endDate)} · {days}{" "}
          {days === 1 ? "Tag" : "Tage"}
        </p>
      </div>

      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <AvatarStack people={trip.participants} />
        {trip.totalCost > 0 && (
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {formatCurrency(trip.totalCost)}
          </span>
        )}
      </div>
    </Link>
  );
}
