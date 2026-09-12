import { getTripInfoItems } from "@/lib/firestore-db";
import { INFO_CATEGORIES, INFO_CATEGORY_LABELS } from "@/lib/labels";
import { createInfoItem, deleteInfoItem } from "@/lib/actions/info";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function TripInfoPage({
  params,
}: PageProps<"/trips/[id]/infos">) {
  const { id } = await params;

  const items = await getTripInfoItems(id);

  const byCategory = new Map<string, typeof items>();
  for (const category of INFO_CATEGORIES) byCategory.set(category, []);
  for (const item of items) byCategory.get(item.category)?.push(item);

  const createInfoItemWithTrip = createInfoItem.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <details className="card p-6">
        <summary className="cursor-pointer font-serif text-xl">
          Info hinzufügen
        </summary>
        <form action={createInfoItemWithTrip} className="flex flex-col gap-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Kategorie
              <select name="category" required className="input" defaultValue="SONSTIGES">
                {INFO_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {INFO_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Titel
              <input name="title" required placeholder="z. B. Notfallnummer Versicherung" className="input" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Inhalt
            <textarea name="content" rows={3} required placeholder="z. B. +49 123 456789, Police-Nr. XY" className="input" />
          </label>
          <div>
            <button type="submit" className="btn btn-primary">
              Speichern
            </button>
          </div>
        </form>
      </details>

      {INFO_CATEGORIES.map((category) => {
        const categoryItems = byCategory.get(category) ?? [];
        if (categoryItems.length === 0) return null;
        return (
          <div key={category} className="flex flex-col gap-3">
            <h2 className="font-serif text-xl">{INFO_CATEGORY_LABELS[category]}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {categoryItems.map((item) => (
                <div key={item.id} className="card p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <form action={deleteInfoItem.bind(null, id, item.id)}>
                      <ConfirmSubmitButton
                        confirmMessage="Diesen Eintrag wirklich löschen?"
                        className="btn btn-ghost text-xs"
                      >
                        Löschen
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          Noch keine Infos hinterlegt.
        </p>
      )}
    </div>
  );
}
