# CodeVerse 2.0 · The Heist

A complete, buildless event website. Source: `index.html`, `css/`, `js/`, `assets/`. Public copy follows the supplied `../content.md`. The Phase 1 tasks, scoring, budget, and publicity plan are never exposed.

## Preview locally

From this folder:

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. The site can be hosted by any static hosting service.

## Before registration opens

Edit `js/config.js` and set `unstopUrl` to the official event registration page. The page deliberately does not link to an unrelated Unstop event or generic listing. Without the official link it shows a clear coming-soon message. The ₹99 fee is presented without claiming a per-team or per-person basis.

Set `seatsRemaining` only when you have an accurate count (0–45). Leave it `null` to hide availability. A value of `0` activates the full state. Add sponsors or organizers to the existing arrays to reveal those sections; no placeholder entries appear.

All event dates and countdowns use Asia/Kolkata. Registration closes at the end of 6 October. The schedule highlights the current slot on event day.

## Included

- Five native-scroll hero beats, skip intro, original vault artwork, and supplied CodeAI logo.
- Responsive layouts, keyboard navigation, visible focus states, and static reduced-motion hero.
- Client-only codenames, downloadable PNG crew IDs, native sharing with clipboard fallback.
- Google Calendar link and `.ics` download (08:00–18:00 IST).
- Optional, user-enabled original ambient sound; no autoplay or third-party soundtrack.
- Locally bundled open-source fonts and license files.
- Search metadata and a social preview image.

The website does not collect or transmit crew names. Sharing is initiated by the visitor.

`dist/` is a deployment copy of the source and assets. `.openai/hosting.json` identifies the private Sites deployment. Refresh `dist/` after source changes before publishing.
