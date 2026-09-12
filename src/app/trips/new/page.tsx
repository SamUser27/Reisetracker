import { getPeople } from "@/lib/firestore-db";
import { createTrip } from "@/lib/actions/trips";
import { createPersonAction } from "@/lib/actions/people";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function NewTripPage() {
  const people = await getPeople();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="font-serif text-3xl">Neue Reise</h1>

      <form
        action={createTrip}
        className="card p-6 flex flex-col gap-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Titel
            <input
              name="title"
              required
              placeholder="z. B. Sommerurlaub Portugal"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Reiseziel
            <input
              name="destination"
              required
              placeholder="z. B. Lissabon, Portugal"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Von
            <input name="startDate" type="date" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Bis
            <input name="endDate" type="date" required className="input" />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Titelbild URL (Optional)
          <input
            name="coverImageUrl"
            type="url"
            placeholder="https://images.unsplash.com/... (optional)"
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Notizen
          <textarea
            name="notes"
            rows={3}
            placeholder="Optional: kurze Beschreibung der Reise"
            className="input"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm mb-1">Wer war dabei?</legend>
          {people.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              Noch niemand angelegt — unten hinzufügen.
            </p>
          )}
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
                  defaultChecked
                />
                <Avatar name={person.name} color={person.colorTag} size={24} />
                {person.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <button type="submit" className="btn btn-primary">
            Reise anlegen
          </button>
        </div>
      </form>

      <details className="card p-6">
        <summary className="cursor-pointer font-medium">
          Neue Person hinzufügen
        </summary>
        <form action={createPersonAction} className="flex gap-3 mt-4">
          <input
            name="name"
            required
            placeholder="Name"
            className="input"
          />
          <button type="submit" className="btn btn-secondary shrink-0">
            Hinzufügen
          </button>
        </form>
      </details>
    </div>
  );
}
