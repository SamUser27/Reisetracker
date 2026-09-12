import Link from "next/link";
import { getTrips } from "@/lib/firestore-db";
import { TripCard } from "@/components/TripCard";
import { UpcomingTripCard } from "@/components/UpcomingTripCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trips = await getTrips();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = trips.filter(
    (t) => new Date(t.endDate).setHours(0, 0, 0, 0) >= today.getTime()
  );
  const pastTrips = trips
    .filter((t) => new Date(t.endDate).setHours(0, 0, 0, 0) < today.getTime())
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Unsere Reisen</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {trips.length === 0
              ? "Noch keine Reise erfasst."
              : `${trips.length} ${trips.length === 1 ? "Reise" : "Reisen"} insgesamt.`}
          </p>
        </div>
        <Link href="/trips/new" className="btn btn-primary">
          Neue Reise
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-secondary)]">
          Legt eure erste Reise an, um Aufenthalt, Kosten und Planung
          festzuhalten.
        </div>
      ) : (
        <>
          {upcomingTrips.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-2xl">Nächste Reiseziele</h2>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  Ohne Vorschaubild
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {upcomingTrips.map((trip) => (
                  <UpcomingTripCard
                    key={trip.id}
                    trip={{
                      id: trip.id,
                      title: trip.title,
                      destination: trip.destination,
                      startDate: trip.startDate,
                      endDate: trip.endDate,
                      totalCost: trip.expenses.reduce((sum, e) => sum + e.amount, 0),
                      participants: trip.participants.map((p) => p.person),
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {pastTrips.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl">Vergangene Reisen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {pastTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={{
                      id: trip.id,
                      title: trip.title,
                      destination: trip.destination,
                      startDate: trip.startDate,
                      endDate: trip.endDate,
                      coverImagePath: trip.coverImagePath,
                      totalCost: trip.expenses.reduce((sum, e) => sum + e.amount, 0),
                      participants: trip.participants.map((p) => p.person),
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
