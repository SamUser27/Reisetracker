# Reise-Tracker

Eigene App für unsere Reisen: Übersicht, Kosten mit Aufteilung, Tagesplanung
und wichtige Infos (Notfallnummern, Gepäck etc.) — als Ablösung für Notion.

## Tech-Stack

- **Next.js 16** (App Router) + TypeScript + Server Actions
- **Prisma ORM** mit **SQLite** (lokale Datei, kein externer Dienst nötig)
- **Tailwind CSS v4** mit eigenem, warmem Reise-Design

## Setup

```bash
npm install
npx prisma migrate dev   # legt prisma/dev.db an und wendet das Schema an
npx prisma db seed       # legt Samu & Luisa als Personen an
npm run dev
```

Die App läuft dann unter [http://localhost:3000](http://localhost:3000).

## Dauerhafter Hintergrunddienst (macOS)

Die App läuft als **LaunchAgent** dauerhaft im Hintergrund — startet automatisch
bei jeder Anmeldung und bei einem Absturz neu, kein manuelles `npm run dev` mehr
nötig. Läuft im Produktions-Modus (`npm run build` + `npm run start`).

- Konfiguration: `~/Library/LaunchAgents/com.samuelbauch.reisetracker.plist`
- Logs: `logs/out.log`, `logs/error.log`
- **Nach Code-Änderungen neu bauen + neu starten**: `./scripts/redeploy.sh`
- Dienst manuell stoppen: `launchctl unload ~/Library/LaunchAgents/com.samuelbauch.reisetracker.plist`
- Dienst manuell starten: `launchctl load -w ~/Library/LaunchAgents/com.samuelbauch.reisetracker.plist`
- Status prüfen: `launchctl list | grep reisetracker`

## Wo liegen die Daten?

- **Datenbank**: `prisma/dev.db` (SQLite-Datei, liegt nur auf diesem Rechner)
- **Titelbilder**: `public/uploads/`

Beides ist in `.gitignore` ausgeschlossen. **Da alles nur lokal liegt,
empfiehlt sich ein gelegentliches Backup** (z. B. Time Machine, oder die
Datei/den Ordner manuell kopieren) — bis zum Umzug in die Cloud (siehe unten)
gibt es sonst keine Absicherung gegen Datenverlust.

## Umzug in die Cloud (später)

Die Architektur ist bewusst so gebaut, dass dieser Schritt klein bleibt:

1. **Datenbank**: In `prisma/schema.prisma` den Provider von `sqlite` auf
   `postgresql` ändern, einen gehosteten Postgres anlegen (z. B. Neon,
   Supabase oder Vercel Postgres), `DATABASE_URL` in `.env` setzen und
   `npx prisma migrate deploy` laufen lassen. Der komplette Anwendungscode
   (Server Actions, Queries) bleibt unverändert, da er nur über Prisma auf
   die Datenbank zugreift.
2. **Bilder**: Nur `src/lib/storage.ts` muss angepasst werden — `saveImage`
   und `deleteImage` schreiben aktuell lokal nach `public/uploads`. Für die
   Cloud dort auf einen Objekt-Storage-Client umstellen (z. B. Vercel Blob).
3. **Deployment**: z. B. auf Vercel deployen (passt direkt zu Next.js).

## Funktionen

- **Übersicht** (`/`): alle Reisen mit Titelbild, Zeitraum, Dauer und
  Gesamtkosten
- **Reise-Detail** (`/trips/[id]`) mit vier Tabs:
  - **Übersicht**: Notizen, Kosten nach Kategorie
  - **Ausgaben**: Ausgaben erfassen (Datum, Betrag, Kategorie, bezahlt von,
    gilt für wen), automatischer Schulden-Ausgleich ("X schuldet Y Z €")
  - **Planung**: Tag-für-Tag-Übersicht mit Unterkunft und Aktivitäten
  - **Infos**: Notfallnummern, Gepäck, Dokumente, Sonstiges

Personen (z. B. weitere Mitreisende) lassen sich beim Anlegen/Bearbeiten
einer Reise direkt hinzufügen — die App ist nicht auf zwei Personen fixiert.
