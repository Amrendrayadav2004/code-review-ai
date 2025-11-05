## Quick orientation — what this repo is

- Next.js (app router) single-page UI. Main interactive logic lives in `app/page.tsx` (client component) and layout/styling in `app/layout.tsx` + `app/globals.css`.
- Built with Tailwind + `next/font` (Geist) for typography. Icons come from `lucide-react`.

## Big picture & data flow

- The app is a client-side code-review UI: user pastes code in the textarea, the client component (`app/page.tsx`) sends the code to Google Gemini via a direct REST call and renders the returned review in the chat UI.
- Key network call: `analyzeCode()` posts JSON to
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`
  and reads the text at `data.candidates[0].content.parts[0].text`.
- Messages are stored as an array of { role: 'assistant'|'user', content: string } in component state — many UI behaviors (copy, styles, alignment) depend on that shape.

## Developer workflows (how to run / build / lint)

- Install and run dev server: `npm install` then `npm run dev` (opens on http://localhost:3000).
- Build for production: `npm run build` then `npm start`.
- Lint: `npm run lint` (calls `eslint` from package.json). Run `npx eslint .` for explicit target.

Notes: there are no tests or CI configs detected. The README contains the standard create-next-app instructions.

## Project-specific conventions and gotchas for code-modifying agents

- This is an app-router Next.js project (top-level `app/` dir). Components under `app/` often use the `"use client"` pragma — moving code server-side requires removing that directive and adjusting fetch/side-effect usage.
- The current design keeps the Gemini API key entirely client-side by letting users paste it into the UI (`app/page.tsx`). Do NOT hardcode API keys. If you introduce a server proxy or env-based key, update `analyzeCode()` and UI flows accordingly.
- Response parsing is fragile and specific: `data.candidates[0].content.parts[0].text`. If switching LLM provider or model, update parsing and tests that assume this path.
- UI + logic are colocated in `app/page.tsx`. When refactoring, preserve the `messages` array shape and the keyboard shortcut behavior (Cmd/Ctrl + Enter to submit) unless intentionally changing UX.

## Common edit examples (concrete guidance)

- To change or replace the LLM provider:
  1. Update `analyzeCode()` in `app/page.tsx`.
  2. Keep or map the response into the existing `assistant` message format: { role: 'assistant', content: string }.
  3. Update error handling where `response.ok` is checked and the friendly client error message returned.

- To move the API call server-side for security:
  - Add an API route (Next.js App Router route handler) or an edge function to accept the code, call the external API using server-stored env var (e.g., `process.env.GEMINI_API_KEY`), and return the parsed text to the client.
  - Update the client `analyzeCode()` to call the new internal API endpoint.

## Files to reference when making changes

- `app/page.tsx` — main UI + `analyzeCode()` implementation, message data shape, keyboard shortcuts, clipboard handling.
- `app/layout.tsx` & `app/globals.css` — global layout and fonts (use `next/font` pattern already present).
- `package.json` — scripts and dependency versions (Next 16, React 19, Tailwind 4). Use these for build/lint expectations.
- `postcss.config.mjs` / `tailwind` config — styling pipeline if you edit CSS or classes.

## What to avoid

- Don't commit secrets or move the API key into source. The current app relies on user-entered API keys; any change that centralizes keys must be explicit and secure (env vars + server proxy).
- Don't change the `messages` array shape without updating all UI usages (alignment, copy-button, isLoading handling).

If anything below is unclear or you want me to expand examples (API proxy implementation, unit test skeletons, or a safe env-based migration), tell me which area and I'll iterate. 
