# Endrit, portfolio

The portfolio of Endrit, independent brand and motion designer in Gjilan, Kosovo.

The homepage is a **light table** in a dark room: the glass box designers use to trace a rough sketch into a clean mark. Everything on it opens a section. The idea behind the site is the *second read*: the first look gives you the form, the second gives you the idea. The table does it too. Each tracing sheet shows a pencil sketch, the finished mark sits faintly on the sheet underneath, and hovering brings the two into register.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Sanity 6, with the Studio embedded at `/studio`
- three.js + React Three Fiber for the 3D table, loaded only on capable desktops
- Mux for video, dotLottie for Lottie
- Vitest for unit tests
- Deploys to Vercel

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + tests
npm run build        # production build
```

Nothing needs configuring to start. Without a Sanity project the site runs on **seed content** (`lib/content/seed.ts`), taken only from the brief. Copy `.env.example` to `.env.local` when you're ready to connect services.

## Connect Sanity

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) (or run `npx sanity@latest init --env` and skip the file generation).
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in `.env.local` and in Vercel.
3. In the Sanity project's API settings, add CORS origins for `http://localhost:3000` and your production URL, with credentials allowed.
4. Open `/studio`, sign in, and fill in **Settings** (email, availability, selected work order) and the **Light table**.
5. For instant updates on publish, add a webhook in Sanity (API → Webhooks):
   - URL: `https://your-domain/api/revalidate`
   - Trigger on create, update, delete
   - Secret: the same value as `SANITY_REVALIDATE_SECRET`
6. For video, add a Mux access token: open any Mux field in Studio and follow the prompt.

## Where content lives

Everything content-related is edited in `/studio`. New code is only for new functionality.

| In Studio | What it controls |
| --- | --- |
| **Case studies** | Skim layer (client, year, role, deliverables, the Connection in one sentence), the story blocks, the mark and sketch shown on the light table, cover image or video |
| **Experiments** | Always labelled *Personal experiment* or *Self-initiated*. Each starts with its question |
| **Light table** | Which section each object opens, its masking-tape label, the one-line note shown on phones, the mixtape's J-card tracks |
| **Motion** | Short pieces (Mux video or Lottie), drag to reorder |
| **Logos** | The mark collection, drag to reorder. The first 20 fill the slide page on the table |
| **Fun** | Images, tracks and notes |
| **About** | Headline, body, location line |
| **Settings** | Email, availability line, selected work order, section intros, wordmark, links |

### Story blocks

Case studies and experiments are built from reorderable blocks, so each project gets its own pacing: Text, Statement, Image, Image pair, Gallery, Video, Lottie, **The Connection**, Before / after, Palette, Typeface, Quote, Applications, Steps, Pause.

Text and statement blocks can be tagged with a story step (Context, Problem, The obvious answer, What I noticed, The Connection, Identity development, System, Applications, Final result). Skip any step a project doesn't need.

**The Connection** block has three reveals:

- *Statement*: the sentence and the mark.
- *Line*: draws a line through the mark in non-photo blue. The line is set in Studio as two points, in percent of the mark. Built for Fado and KosovaNet.
- *Overlay*: a first read, then a second read, switched by the reader.

## The light table

`components/table/` and `lib/table/`.

- **One description, two renderers.** Every object's face (the sheets, contact sheet, slide page, film strip, cassette, tape labels, frame, glass) is described once in `lib/table/faces.ts` as simple drawing data (`lib/table/draw.ts`). The server renders it as inline SVG; the 3D scene draws the same data onto canvas textures. The two match, so the 3D table fades in over the flat one without a jump.
- **Geometry lives in one place.** `lib/table/layout.ts` places everything in table units (1600 × 1000). The flat table, the 3D scene and the tests all read from it.
- **Always usable.** The flat table is server-rendered with real links, works without JavaScript, and is what search engines see. The 3D scene loads after first paint, only with a large screen, a mouse, WebGL 2, motion allowed and no data saver. Otherwise the flat table stays.
- **Phones get their own design.** A phone screen is backlit glass already, so on phones the screen becomes the light table: the objects are cards you swipe through, and each sketch slides into register as its card reaches the centre.
- **Skip is always one click.** "All work" is in the header on every page, second in the tab order after the home link. Every section and case study has its own URL.
- **The room follows Gjilan's clock.** By day a faint window light falls across the room; at night only the table is lit. The footer shows the local time.

Performance: the 3D code (three.js + R3F, about 220 KB gzipped) is split out and loaded after first paint. There are no model or texture downloads, since everything is drawn from the faces. Frames render only while something moves, textures are drawn at the screen's pixel density, and the pixel ratio is capped at 1.75.

## Contact form

`/api/contact` sends through [Resend](https://resend.com) when `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are set. Until then the form says it isn't sending and points to the email address, which is always visible and copyable.

## Still to come

- Fado Engineering: the brand identity files and logo SVG, to build its case study and the line reveal
- The real email address (Settings → Email; the seed uses a placeholder)
- The personal wordmark (Settings → Wordmark; it appears in the header and etched into the table frame)
- Final copy. Placeholder copy follows the voice sample from the brief
