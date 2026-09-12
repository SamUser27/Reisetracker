import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/firestore-db";
import { AvatarStack } from "@/components/Avatar";
import { formatDateRange, tripDurationDays } from "@/lib/labels";
import { TripTabs } from "@/components/TripTabs";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { deleteTrip } from "@/lib/actions/trips";

export const dynamic = "force-dynamic";

export default async function TripLayout({
  params,
  children,
}: LayoutProps<"/trips/[id]">) {
  const { id } = await params;

  const trip = await getTripById(id);

  if (!trip) notFound();

  const days = tripDurationDays(trip.startDate, trip.endDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="card overflow-hidden">
        <div className="relative aspect-[3/1] bg-[var(--surface-1)]">
          {trip.coverImagePath ? (
            <Image
              src={trip.coverImagePath}
              alt={trip.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] font-serif text-3xl">
              📍 {trip.destination}
            </div>
          )}
        </div>
        <div className="p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">{trip.title}</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
              {days} {days === 1 ? "Tag" : "Tage"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AvatarStack people={trip.participants.map((p) => p.person)} />
            <Link href={`/trips/${trip.id}/edit`} className="btn btn-secondary">
              Bearbeiten
            </Link>
            <form action={deleteTrip.bind(null, trip.id)}>
              <ConfirmSubmitButton
                confirmMessage={`"${trip.title}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`}
                className="btn btn-ghost"
              >
                Löschen
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      </div>

      <TripTabs tripId={trip.id} />

      {children}
    </div>
  );
}
