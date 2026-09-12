import Image from "next/image";
import Link from "next/link";
import { AvatarStack } from "@/components/Avatar";
import {
  formatCurrency,
  formatDateRange,
  tripDurationDays,
} from "@/lib/labels";

export interface TripCardData {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImagePath: string | null;
  totalCost: number;
  participants: { id: string; name: string; colorTag: string }[];
}

export function TripCard({ trip }: { trip: TripCardData }) {
  const days = tripDurationDays(trip.startDate, trip.endDate);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform"
    >
      <div className="relative aspect-[4/3] bg-[var(--surface-1)]">
        {trip.coverImagePath ? (
          <Image
            src={trip.coverImagePath}
            alt={trip.title}
            fill
            unoptimized
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] font-serif text-2xl">
            {trip.destination}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-serif text-xl leading-snug">{trip.title}</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
          {days} {days === 1 ? "Tag" : "Tage"}
        </p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <AvatarStack people={trip.participants} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {formatCurrency(trip.totalCost)}
          </span>
        </div>
      </div>
    </Link>
  );
}
