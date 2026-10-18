# Exceller Prep — Capgemini Exceller 2027 Preparation

An independent preparation workspace for freshers: learning modules, question practice, coding, debugging, Groq-assisted reasoning, communication, interview preparation and staged mock assessments.

**This is a practice simulation, not a verified description of the 2027 hiring process.** It is not affiliated with Capgemini. Every qualification threshold and readiness label is an internal preparation benchmark. Follow your campus invitation for the actual assessment format.

## Start the app

Node.js 20.9 or later is required (verified here with Node 24).

```powershell
npm install
Copy-Item .env.local.example .env.local
# Edit .env.local and set GROQ_API_KEY if you want AI coaching.
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). All non-AI preparation works without a Groq key. No account is required.

For a production build:

```powershell
npm run build
npm run start
```

Both commands bind to localhost by default. Configure your deployment platform separately if publishing the app.

## What is implemented

- Responsive desktop-first dashboard with honest zero-state data, daily plan, simulated process roadmap, preparation progress, streak and weighted readiness.
- Eleven learning modules: AI Literacy, Technical Fundamentals, DBMS, SQL, OOP, Operating Systems, Computer Networks, DSA, RAG, Generative AI and Prompt Engineering. Concepts include explanations, examples, traps, cheat sheets, interview prompts, bookmarks and attached notes.
- **250 AI/technical MCQs:** 100 AI, 40 DBMS, 40 SQL, 25 OOP, 25 OS, 20 CN. RAG/GenAI concepts have more than 30 questions; SQL includes concrete query-output and query-selection questions.
- **75 coding problems** in the requested category distribution, **50 debugging problems**, **30 AI coding problems**, **80 reasoning questions**, **110 specific interview questions**, and communication exercises.
- Randomized answer display, topic/difficulty/status/bookmark filters, answer explanations, incorrect-answer revision queues and 0/1/3/7-day revisit scheduling.
- Monaco editor with locally served assets, saved drafts, sample/hidden test console, progressive hints, approach reveal, confirmed solution reveal, attempt counts and completion status.
- Real Python and JavaScript execution in disposable browser workers. Reference solutions are Python; tests use a JSON input passed to `solve(data)` and compare its return value.
- Groq reasoning checklist, structured approach evaluation with score breakdown, validated server responses and a **server-enforced code-generation gate**. All required components must be adequate and the score must be at least 70.
- Optional 2,000-token simulation using a character-count estimate; not a billing measurement.
- Six practice blueprints with timers, shuffled question selection, technical topic balance, saved active attempts, mark-for-review, question palettes and progressive unlocking: MCQ → debugging → AI coding → reasoning MCQs (where included) → result.
- Five additional reserved Final Exceller papers: MCQ → debugging → coding → AI coding → cognitive games. Each uses its own 30 contextual MCQs, three programming tasks and seven seeded hard cognitive puzzles. Reserved content is absent from regular practice/search banks, and papers do not share their authored questions or programming tasks. Retakes reuse the selected paper and are labelled accordingly.
- Mock history and results with simulated qualification, stage scores, topic breakdown, answer review, strengths/weaknesses and practice links. Failed attempts cannot advance.
- Notes, bookmarks, interview revision statuses, theme/language/benchmark settings, progress export/reset and Recharts analytics.

### Readability and question quality update

The interface now uses a shared text scale: 16px minimum captions, 18px controls/navigation and 20px assessment reading at the default size. The top bar and Settings offer A/A+/A++ (Comfortable/Large/Extra large), saved locally and also available during mocks. Both themes use stronger text contrast and a restrained navy/teal palette.

All 250 AI/technical and 80 reasoning MCQs have explicit scenario information or assumptions, explanations for all four options and revision takeaways. Scenarios appear in mocks before submission; answers and explanations remain locked until review. Question IDs, bookmarks and notes are preserved. See [DESIGN-RESEARCH.md](DESIGN-RESEARCH.md) for the research, design rationale and limits of colour-psychology claims.

## Groq setup

Use `.env.local`:

```dotenv
GROQ_API_KEY=your_actual_key
```

Restart the server after changing this file. Do not prefix the key with `NEXT_PUBLIC_`.

The server uses Groq’s chat completions API with `openai/gpt-oss-120b`, configured in `config/ai.ts`. Set `GROQ_MODEL` to override it. Strict JSON schema output is used for supported models; server-side Zod validation always applies. Low reasoning effort and bounded outputs keep requests responsive. No Gemini fallback or hosted Hugging Face calls are made.

The route validates the problem ID, language, reasoning fields and request size. It rejects cross-origin browser requests, applies a basic in-process rate limit, uses a timeout and validates structured evaluation output with Zod. It recalculates the score and re-evaluates the approach on every generation request; a client-provided score cannot unlock an implementation. Groq content is rendered as text.

Generated Python and JavaScript must accept an already-decoded JSON value in `solve(data)` and return the answer, without stdin or printed output. Prompts include the problem's input/output formats and visible examples; hidden tests stay private. A Groq `output_parse_failed` error gets at most one JSON-mode fallback within the original request deadline; server-side score validation still applies.

Evaluation parsing accepts a complete JSON code fence, an `evaluation` wrapper, and integer score strings. Component limits, missing-component feedback and boolean eligibility remain mandatory. Totals are computed locally. An invalid evaluation receives at most one corrective evaluation request; the entire evaluation/generation flow shares an 80-second deadline. Quota and network errors do not trigger that repair.

`/api/ai/status` reports only whether a key is configured. It does not validate the key. Missing-key, invalid-key/model-access, quota, timeout, malformed-response and network errors are displayed without losing your saved approach.

Official references: [Groq model](https://console.groq.com/docs/model/openai/gpt-oss-120b), [structured output](https://console.groq.com/docs/structured-outputs), [rate limits](https://console.groq.com/docs/rate-limits). Free-tier requests remain subject to your account and model limits; this app does not purchase credits or upgrade your plan.

The Groq migration preserves the existing reasoning gate. Add your own `GROQ_API_KEY` and restart the server to use it. `.env` and `.env.local` are both supported; keys stay on the server. `/api/ai/status` only reports configuration, provider and model—it does not validate credentials or expose them.

## Cognitive games

Open `/cognitive` from the sidebar or the mock-test hub. Seven original games cover Switch, Shape Switch, Digit, Grid Memory (with a mirror-judgment interruption), Motion, Deductive and Inductive practice. Each has easy/standard/hard difficulty, five-puzzle untimed practice and a three-minute timed mode. Results and accuracy are saved on this device with preparation progress; old saves receive an empty game history automatically. The latest 200 game sessions are retained. These games run in the browser and require no AI requests or additional account.

The game types were researched from [CognitiveGames](https://www.cognitivegames.me/games/cognitive) and [Technical Hub](https://technicalhub.io/capgemini/). Mechanics, puzzles, interface and scoring are independently implemented. Session timing and game selection are preparation simulations, not verified hiring requirements. The older reasoning MCQs remain a separate mock-test exercise.

## Code execution boundaries

### Reserved final exam mode

Open `/mocks` and select **Fresh Final Exceller Simulation 1–5**. Stage limits are 40/20/30/30/14 minutes (134 minutes total). MCQs use your configured benchmark; debugging, coding and AI coding require at least 70%, with an accepted approach also required in AI coding. The last stage requires at least five of seven puzzles correct. All thresholds are practice settings, not official cutoffs.

Starting a reserved paper requests browser fullscreen. If fullscreen is unavailable or denied, no attempt starts. Use a desktop browser that supports the Fullscreen API. The first detected fullscreen exit, hidden tab, focus loss or page departure ends the attempt and stores its reason. There is no pause/resume in this mode; refresh ends the attempt. This is a local browser deterrent, not an OS lockdown or secure proctoring service. Older practice blueprints retain their save/resume behavior. Reserved scores remain in mock history and do not inflate normal practice-bank completion.

Debugging starters use named variables, explicit blocks and ordinary multiline Python. All fifteen reference solutions have eight authored cases each; `scripts/audit-final-content.py` also checks each against 200 reproducible independent brute-force inputs. This audit only executes trusted authored reference code, never user submissions.

Python loads Pyodide 0.27.7 from jsDelivr and needs an internet connection on first use. JavaScript executes inside a fresh worker with no DOM/localStorage access. The worker is terminated after each run, and the adapter times out after 30 seconds. No candidate code executes in a server process.

Java and C++ have editor/starter support and saved drafts, but **are editor-only in this version**. `services/execution.ts` exposes `executeCode()` so an authenticated sandbox provider can be added later; unavailable languages return an explicit explanation instead of fake passing results.

These are local learning assessments, not adversarially secure or proctored exams. All seed data, reference answers and hidden test definitions are delivered to the browser. Hidden values are suppressed in the console, but a user inspecting the app can find them. Browser workers are isolation from the UI, not a hardened untrusted-code security boundary. Do not use this runner for evaluating hostile third-party code.

## Storage and architecture

```text
app/                  Next.js App Router, styles, server-only AI routes
components/           Application shell, reusable UI and shadcn-style Button
features/             Dashboard, learning, MCQs, coding, AI, mocks, library
data/                 Separate structured JSON banks and typed exports
types/                Question, problem, progress, mock and AI contracts
hooks/progress.tsx    Shared progress state and persistence actions
services/storage.ts  ProgressRepository interface + validated local adapter
services/execution.ts Browser worker execution adapter
lib/                  Scoring, randomization, readiness and AI validation
config/ai.ts          Central model configuration and coaching policy
public/workers/        Disposable code runner
scripts/              Reproducible content seeding, audit and editor setup
tests/                Core unit tests and browser integration tests
```

State is stored under `exceller-prep-v1` in localStorage. It includes answers, revision due dates, problem statuses, notes, bookmarks, drafts, topic completion, activity, AI scores, mock history and an active mock. Browser refreshes resume an older practice assessment and its deadline continues while away. Reserved fullscreen finals end on refresh or departure. Each assessment has its own code/approach draft namespace.

If local storage is unavailable, the app remains usable with an in-memory session and displays a notice. Unreadable saved data is preserved rather than overwritten; Settings provides export/reset controls. Export progress before clearing browser data.

To add Supabase later, replace the `ProgressRepository` adapter with a remote implementation and add authentication with user-scoped records and row-level access rules. Make persistence asynchronous and add a debounced write queue; the current local adapter is synchronous. In-process rate limits must also become shared when deploying multiple server instances.

## Readiness and progress

Readiness weights: technical MCQ completion 25%, AI MCQ completion 15%, coding completion 20%, debugging completion 15%, AI coding completion 15%, and qualified mock progress 10%. It measures breadth of demonstrated preparation and is not a prediction of hiring outcomes.

Statuses distinguish attempted, solved without hints, solved with hints and solution viewed. Viewing a reference solution prevents that problem from being counted as independently solved. Topic accuracy uses the latest answer for each unique question; attempt counts are retained. Streaks and daily plans use the browser's local calendar date.

Communication speaking/email/workplace exercises are self-reviewed. Speaking uses a 60-second preparation and 90-second response timer. Listening-style playback uses the browser speech-synthesis API; there is no microphone recording or automatic speech scoring.

## Commands and verification

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

To use an already installed Chrome instead of downloading Playwright Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run test:e2e
```

Other commands:

- `npm run seed`: recreate all local banks from the original content generators. Stable question IDs are retained.
- `python scripts/audit-data.py`: execute every Python reference against all stored tests and verify each debugging implementation fails a case (intentional nonterminating mutations are excluded from in-process execution).
- `npm run format`: format source files with Prettier.

Monaco assets are copied from the installed package automatically before development and production builds. Generated `public/monaco` is ignored by Git.

At handoff, the production build, lint, core tests, browser flows and reference-solution audit were verified. Browser tests cover navigation, scoring, persistence, notes/bookmarks, staged locking, missing API key handling, real Python/JavaScript execution and desktop/mobile layout.

The production dependency audit is clean after pinning the patched DOMPurify transitive dependency. The development-only lint dependency chain currently includes the unpatched `braces` advisory through `eslint-config-next`; no incompatible Next.js downgrade was applied. Update that chain when a compatible upstream fix is available. This does not make a public multiuser deployment production-hardened; authentication, durable storage, distributed limits, monitoring and a hardened execution provider remain deployment work.
