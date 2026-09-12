#!/bin/bash
# Baut die App neu und startet den Hintergrunddienst (LaunchAgent) neu.
set -e
cd "$(dirname "$0")/.."
npm run build
launchctl kickstart -k "gui/$(id -u)/com.samuelbauch.reisetracker"
echo "Neu gebaut und Dienst neu gestartet."
