import { notFound } from "next/navigation";
import { getTripById, getTripPlanDays } from "@/lib/firestore-db";
import { formatDateLong } from "@/lib/labels";
import { savePlanDay } from "@/lib/actions/plan";

export const dynamic = "force-dynamic";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function TripPlanPage({
  params,
}: PageProps<"/trips/[id]/planung">) {
  const { id } = await params;

  const trip = await getTripById(id);
  if (!trip) notFound();

  const planDays = await getTripPlanDays(id);
  const planByDate = new Map(
    planDays.map((day) => [toDateInputValue(day.date), day]),
  );

  const dayCount =
    Math.round(
      (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const days = Array.from({ length: Math.max(dayCount, 1) }, (_, i) =>
    addDays(trip.startDate, i),
  );

  return (
    <div className="flex flex-col gap-4">
      {days.map((date, index) => {
        const key = toDateInputValue(date);
        const existing = planByDate.get(key);
        const saveDayAction = savePlanDay.bind(null, id);

        return (
          <form key={key} action={saveDayAction} className="card p-5 flex flex-col gap-3">
            <input type="hidden" name="date" value={key} />
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-[var(--text-muted)]">Tag {index + 1}</span>
              <h3 className="font-serif text-lg">{formatDateLong(date)}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Unterkunft
                <input
                  name="accommodationName"
                  defaultValue={existing?.accommodationName ?? ""}
                  placeholder="z. B. Hotel Aurora"
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Notiz zur Unterkunft
                <input
                  name="accommodationNote"
                  defaultValue={existing?.accommodationNote ?? ""}
                  placeholder="z. B. Check-in ab 15 Uhr"
                  className="input"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              Was steht an?
              <textarea
                name="activities"
                rows={2}
                defaultValue={existing?.activities ?? ""}
                placeholder="Grobe Aktivitäten für den Tag"
                className="input"
              />
            </label>
            <div>
              <button type="submit" className="btn btn-secondary">
                Tag speichern
              </button>
            </div>
          </form>
        );
      })}
    </div>
  );
}
