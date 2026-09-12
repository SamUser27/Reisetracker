import { notFound } from "next/navigation";
import { getPeople, getTripById } from "@/lib/firestore-db";
import { updateTrip } from "@/lib/actions/trips";
import { createPersonAction } from "@/lib/actions/people";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditTripPage({
  params,
}: PageProps<"/trips/[id]/edit">) {
  const { id } = await params;

  const [trip, people] = await Promise.all([
    getTripById(id),
    getPeople(),
  ]);

  if (!trip) notFound();

  const participantIds = new Set(trip.participantIds);
  const updateTripWithId = updateTrip.bind(null, trip.id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="font-serif text-3xl">Reise bearbeiten</h1>

      <form
        action={updateTripWithId}
        className="card p-6 flex flex-col gap-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Titel
            <input
              name="title"
              required
              defaultValue={trip.title}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Reiseziel
            <input
              name="destination"
              required
              defaultValue={trip.destination}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Von
            <input
              name="startDate"
              type="date"
              required
              defaultValue={toDateInputValue(trip.startDate)}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Bis
            <input
              name="endDate"
              type="date"
              required
              defaultValue={toDateInputValue(trip.endDate)}
              className="input"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Titelbild URL (Optional)
          <input
            name="coverImageUrl"
            type="url"
            defaultValue={trip.coverImagePath ?? ""}
            placeholder="https://images.unsplash.com/..."
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notizen
          <textarea
            name="notes"
            rows={3}
            defaultValue={trip.notes ?? ""}
            className="input"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm mb-1">Wer war dabei?</legend>
          <div className="flex flex-wrap gap-3">
            {people.map((person) => (
              <label
                key={person.id}
                className="flex items-center gap-2 panel px-3 py-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  name="participantIds"
                  value={person.id}
                  defaultChecked={participantIds.has(person.id)}
                />
                <Avatar name={person.name} color={person.colorTag} size={24} />
                {person.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <button type="submit" className="btn btn-primary">
            Änderungen speichern
          </button>
        </div>
      </form>

      <details className="card p-6">
        <summary className="cursor-pointer font-medium">
          Neue Person hinzufügen
        </summary>
        <form action={createPersonAction} className="flex gap-3 mt-4">
          <input name="name" required placeholder="Name" className="input" />
          <button type="submit" className="btn btn-secondary shrink-0">
            Hinzufügen
          </button>
        </form>
      </details>
    </div>
  );
}
