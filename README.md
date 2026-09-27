# CodeVerse 2.0 · The Heist

A standalone website for CodeAI's coding competition. It needs no ChatGPT account, API key, backend, or hosting service. All artwork, fonts, and production JavaScript are served from this project.

## Run locally

Use Node.js 20 or newer. From this folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. After editing a source file, run `npm run build` and refresh the browser. To serve an existing build, use `npm run preview`.

## Deploy to Vercel

Import a repository containing this project into Vercel. If the repository contains this `site/` folder, select **site** as the Root Directory. If you extracted the standalone archive or use this folder as the repository root, leave the Root Directory at its default.

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

The included `vercel.json` supplies the build and output settings. Optionally set the `SITE_URL` environment variable to your final origin, such as `https://your-domain.com`. The build uses that URL for canonical metadata, social image links, `robots.txt`, and `sitemap.xml`. Otherwise it uses Vercel's production URL when available.

You can also deploy from this folder with Vercel's CLI:

```sh
npx vercel
```

See the official [project configuration documentation](https://vercel.com/docs/project-configuration) and [CLI deployment documentation](https://vercel.com/docs/cli/deploy). This project has been prepared and checked locally; it has not yet been deployed to a Vercel account.

## Other hosting services

Run `npm ci` followed by `npm run build`, then upload the **contents of dist/** to any static web host. Node.js is only needed to build and preview; the deployed site is ordinary HTML, CSS, images, and JavaScript. Serve it over HTTP(S), rather than opening `index.html` directly, because the 3D scene uses browser modules.

## Event configuration

Edit `js/config.js` and set `unstopUrl` when the official event registration page is confirmed. Without that URL, the registration controls show a coming-soon message. The ₹99 fee is presented without claiming a per-team or per-person basis.

Set `seatsRemaining` only when you have an accurate count (0–45). Leave it `null` to hide availability; `0` activates the full state. Add sponsors or organizers to the existing arrays to reveal those sections. Dates and countdowns use Asia/Kolkata. Registration closes at the end of 6 October.

## Hero and accessibility

The five-beat hero uses a real Three.js vault and one GSAP ScrollTrigger playhead. Native scroll advances a hinged door, camera, and separate text planes. The camera pauses at each beat, reverses with scrolling, and stops rendering offscreen. Mobile uses a shorter scroll distance and a capped rendering resolution.

All five messages are authored in the HTML. Reduced motion, the Motion button, missing dependencies, and unavailable WebGL produce a normal-flow illustrated introduction with every message accessible. The original poster stays beneath the canvas. There is no scroll hijacking or autoplay sound.

The existing crew ID generator, PNG download, sharing, calendar downloads, FAQ, registration states, and optional sound remain included. Crew names stay in the visitor's browser.

## Files

- `index.html`, `css/`, `js/`, `assets/`: editable source and local assets.
- `js/hero-3d.js`: vault geometry, camera path, and scroll choreography.
- `scripts/build.mjs`: independent static build; copies pinned libraries locally.
- `vercel.json`: deployment configuration.
- `dist/`: generated, ready-to-host website.

Public copy follows the supplied event content. Phase 1 task statements and their scoring, budget, and publicity plan stay off the public website. Font and library license notices are included with the build.
