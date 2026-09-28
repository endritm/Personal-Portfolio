@AGENTS.md

# Endrit portfolio

Portfolio for Endrit, independent brand and motion designer. The homepage is a light table in a dark room; the site's idea is the "second read". See README.md for the full picture.

## Commands

- `npm run dev`: dev server on :3000
- `npm run check`: typecheck, lint and unit tests. Run it before every commit.
- `npm run build`: production build

## Map

- `app/(site)/`: public routes. `app/studio/`: embedded Sanity Studio. `app/api/`: contact form and Sanity webhook.
- `lib/content/`: the only way pages read content. `index.ts` queries Sanity, or serves `seed.ts` when Sanity isn't configured.
- `lib/sanity/`: client, env, GROQ queries. `sanity/schemaTypes/`: the Studio schema. Blocks are in `blocks.ts`.
- `lib/table/`: light table geometry (`layout.ts`), drawing vocabulary (`draw.ts`), object faces (`faces.ts`).
- `components/table/`: flat table (server), 3D scene (client, lazy), phone version.
- `components/blocks/`: renders case study and experiment stories.

## Rules

- **Never invent a Connection**, year, role, colour or client fact. If it isn't in Studio or the brief, leave it empty and ask.
- Copy is Endrit's. Placeholder copy follows his voice sample: calm, specific, short sentences, first person singular ("I", never "we").
- Dark only. Non-photo blue (`--blue`) is reserved for second reads and focus rings.
- Content belongs in Studio. New code is for new functionality only. Adding a block means: schema in `sanity/schemaTypes/blocks.ts`, type in `lib/content/types.ts`, projection in `lib/sanity/queries.ts`, renderer in `components/blocks/Blocks.tsx`. The schema test checks that they agree.
- The flat table and the 3D table must stay identical at rest. Change geometry in `lib/table/layout.ts` and faces in `lib/table/faces.ts`, never in one renderer only.
- The table must never block the work: every section keeps a real URL, the flat table keeps real links, and "All work" stays in the header.
- Motion only for reveal, relationship, hierarchy or transition. Respect `prefers-reduced-motion`.
