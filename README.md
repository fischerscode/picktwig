# Picktwig

Eine Frage, mehrere Antworten, für jede Antwort eine Ziel-URL. Ein statischer, responsiver Link-Editor mit Live-Vorschau und Auswahlseite im Apple-inspirierten Design, einschließlich automatischem Hell-/Dunkelmodus.

Wie Stickyurl: **kein Backend, keine Datenbank, keine Abhängigkeiten, kein Build**. Anders als Stickyurl speichert Picktwig keine Auswahl. Keine Cookies, kein Web Storage, kein Tracking und keine externen Ressourcen.

## Starten und veröffentlichen

Live: https://fischerscode.github.io/picktwig/

GitHub Pages ist wie bei Stickyurl auf Branch `main` und Verzeichnis `/` eingestellt. Jeder Push nach `main` veröffentlicht die Website automatisch; ein eigener Build oder Workflow ist für die statischen Dateien nicht nötig.

Das Repository direkt als statische Website ausliefern, beispielsweise mit GitHub Pages (Branch `main`, Verzeichnis `/`). Lokal:

```sh
python3 -m http.server 8080
```

Anschließend `http://localhost:8080` öffnen. Die Kopierfunktion benötigt HTTPS oder localhost; andernfalls bietet die App manuelles Kopieren an. Impressum und Datenschutz übernehmen die Betreiberangaben von Stickyurl und gehen von Hosting über GitHub Pages aus.

## Verwendung

1. Frage und mindestens zwei Antworten mit vollständigen HTTP-/HTTPS-Ziel-URLs eintragen.
2. Optional weitere Antworten hinzufügen (maximal 20).
3. Darstellung wählen: Automatisch, Hell oder Dunkel. Automatisch folgt der Systemeinstellung der Besucher.
4. Link erstellen, kopieren und teilen.
5. Besucher sehen die Frage und öffnen durch Auswahl einer Antwort deren Ziel. Mit „Zurück“ gelangen sie erneut zur Auswahl.

Die geteilte Auswahlseite zeigt ausschließlich die Frage, die Antwortoptionen und Links zu Impressum und Datenschutz. Auch die Live-Vorschau zeigt nur Frage und Optionen.

Die Auswahl verwendet normale Links im selben Tab. Es gibt keine permanente Weiterleitung (HTTP 301/308), keine automatische Wiederholung und keine gespeicherte Entscheidung. Da die App statisch ist, sendet sie auch keinen temporären HTTP-Status 302/307; die Navigation erfolgt im Browser.

## Bestehende Auswahl bearbeiten

Auf der Startseite im Editor „Bestehende Auswahl bearbeiten“ öffnen. Den vollständigen Link, einen Pfad mit `#p=…`, das Fragment `#p=…`, den Parameter `p=…` oder den reinen Konfigurationswert einfügen und „Konfiguration laden“ wählen. Frage, Antworttexte, Ziel-URLs und Darstellung werden übernommen und können geändert werden. Gültige Importe ersetzen die aktuellen Eingaben; bei ungültigen Daten bleiben diese erhalten. Anschließend einen neuen Link erstellen. Bereits geteilte Links bleiben unverändert.

## Linkformat

```text
https://example.org/picktwig/#p=<Base64url-kodiertes UTF-8-JSON>
```

```json
{
  "v": 1,
  "theme": "auto",
  "question": "Was möchtest du entdecken?",
  "options": [
    { "label": "Dokumentation", "url": "https://example.org/docs" },
    { "label": "Kontakt", "url": "https://example.org/contact" }
  ]
}
```

`theme` erlaubt `"auto"`, `"light"` oder `"dark"` und wird im Link gespeichert. Ältere Links ohne dieses Feld verwenden `"auto"`. Die Vorschau zeigt die gewählte Darstellung; die Einstellung wird nicht im Browser gespeichert.

Maximal 240 Zeichen für die Frage, 100 Zeichen pro Antwort und 65.536 Zeichen für das Fragment. URLs werden validiert; andere Protokolle und eingebettete Zugangsdaten sind nicht erlaubt. Ungültige Links zeigen eine Fehlermeldung mit dem Editor. Unicode und Emojis werden unterstützt. Wechsel des Fragments aktualisiert die Ansicht.

Die Konfiguration liegt vollständig im Link, nicht verschlüsselt. Sie wird beim Abruf nicht an den Hosting-Server gesendet, kann aber im Browserverlauf und überall dort verbleiben, wo der Link geteilt wird. Keine vertraulichen Daten eintragen. Extrem lange Links können in Messengern oder Browsern eingeschränkt sein.

## Tests

Mit Node.js 18 oder neuer (nur für Tests, keine Installation notwendig):

```sh
node --test tests/config.test.cjs
```
