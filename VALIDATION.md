# Validation · 27 September 2026

The independent build and syntax checks pass. The exported archive was extracted into a separate folder, installed with `npm ci --offline`, and built successfully. Custom-domain canonical links, social images, and sitemap generation were checked. No ChatGPT hosting identifier or domain is present in the deployment files.

The cinematic skill's five-profile browser matrix passes: desktop, mobile, desktop reduced motion, mobile reduced motion, and JavaScript disabled. Screenshots were visually reviewed at the opening, transition, readable hold, prize reveal, and final action.

Additional browser checks pass for all five camera waypoints, reverse scrolling, idle stability, live Motion changes, WebGL context loss, missing Three.js, unavailable WebGL, keyboard skip navigation, and live resizing at 320, 390, 768, and 1440 pixels. All five messages and the permanent poster remain available in fallback modes.

Crew assignment, roll again, PNG download, calendar download, Google Calendar, FAQ disclosures, and registration date states were checked. The official Unstop link remains unset pending confirmation.

Rendered-frame comparison: same-position idle difference was zero; the scroll change had a mean pixel difference of 20.39 on a 0–255 scale.

Chrome used hardware graphics through ANGLE Metal on Apple M5 Pro. The browser's blank-page and static-site baselines both ran at 30 Hz. The 3D scroll ran at the same cadence, including at 4× CPU throttling. This supports the absence of an additional frame-rate penalty in this environment; a 60 Hz result and performance on physical target phones remain unverified.

The site is prepared for Vercel and other static hosts. No Vercel deployment has been performed.
