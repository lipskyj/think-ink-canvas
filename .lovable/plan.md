
# Hackathon Mode — 10 Major Changes

Goal: take the current 15-step design-thinking kit (Hebrew, RTL, sketch UI) and reshape it so a team of young adults can move from problem → prototype → pitch in **6 hours**. Today the flow is too long, too academic, and stops at PRD — it doesn't help teams ship or pitch.

---

## The 10 Changes

### 1. Add a "Hackathon Mode" with a 6-hour visible timer
A toggle on the home screen turns on Hackathon Mode. A persistent top bar shows the global countdown (default 6h, configurable) plus the current phase budget (e.g. "Problem 60m · Solution 60m · Build 3h · Pitch 60m"). Color shifts amber → red as time runs out. This single change reframes the whole tool from "course" to "sprint".

### 2. Collapse 15 steps into 4 sprint blocks
Re-group the existing pages into a forced linear track instead of 15 peer steps:
```text
PROBLEM (60m)  → Empathy Map + 5 Whys + POV (merged)
SOLUTION (60m) → HMW + Ideation + Effort/Impact (merged)
BUILD   (180m) → Prototype Brief + Storyboard → PRD/Lovable prompt
PITCH   (60m)  → NEW pitch deck + demo script + judging checklist
```
Lesser-used steps (Converge, Persona, JTBD, Journey Map, Assumptions, User Testing) move to an optional "Deep Dive" drawer so they don't block momentum.

### 3. Replace the open dashboard with a guided "Next Step" flow
Today the home page is a 15-tile grid that invites browsing. Hackathon Mode replaces it with a single large "Continue →" card showing the current block, its time budget, and a 3-bullet "what to produce in this block". One decision at a time. Free navigation stays available behind a "Show all steps" link.

### 4. Per-step micro-timers with "good enough" defaults
Each merged block gets sub-timers (e.g. Empathy Map 15m, 5 Whys 10m, POV 10m). When a sub-timer ends, the UI nudges: "Lock it in and move on — you can refine in v2." Prevents the classic hackathon trap of perfecting the problem statement.

### 5. Tone, language, and visuals tuned for young adults
- Hebrew copy rewritten from academic ("הצהרת נקודת מבט", "מטריצת מאמץ-השפעה") to direct hackathon language ("נסחו את הבעיה ב-3 שורות", "מה שווה לבנות עכשיו?").
- Swap the sketch/notebook aesthetic for a higher-energy look: bolder type, accent gradients, motion on state changes, emoji-forward step headers — still readable, not childish.
- Add short example answers (placeholder text) drawn from realistic young-adult problem spaces (campus life, side hustles, social, mental health, climate, gaming) so teams aren't staring at blank fields.

### 6. AI assistant retuned as a hackathon coach
The existing `ai-assist` edge function stays, but the system prompts change:
- Default voice: short, energetic, second-person Hebrew, action verbs.
- New mode `unstuck`: a single button on every screen — "תקועים? קבלו דחיפה" — returns one concrete next sentence + one provocation.
- New mode `challenge`: critiques the team's current answer in 2 lines, like a mentor walking by ("המשתמש שלכם רחב מדי — מי בדיוק?").
- Coherence check (already exists) is auto-triggered when moving between blocks, not on-demand.

### 7. New "Build" block: PRD → working prototype, not just a document
Today the flow ends at `PrdGenerator`. For a hackathon it must end at a *thing you can demo*. Extend the Build block to:
- Produce a Lovable-ready prompt (existing PRD generator, tightened).
- One-click "Open in Lovable" — copies prompt + opens lovable.dev/new in a new tab.
- Checklist of demo-day must-haves (working primary flow, fake data OK, mobile screenshot, 1 wow-moment) instead of a real user-testing protocol.

### 8. New "Pitch" block (currently missing entirely)
A first-class step at the end with three artifacts auto-drafted from prior answers via the AI:
- **60-second pitch script** (Problem → Who → Insight → Solution → Demo → Ask).
- **5-slide deck outline** (rendered on-screen, copyable to Slides/Canva).
- **Judging checklist** (Problem clarity, Insight, Solution fit, Demo, Team energy) so teams self-score before going on stage.
A "Practice timer" button starts a 60s countdown while the script is displayed teleprompter-style.

### 9. Team mode + role assignment
Most hackathon teams are 3–5 people. Add lightweight team support on top of the existing per-user project:
- On project creation, ask team size and auto-suggest roles (Researcher, Designer, Builder, Pitcher).
- Each block highlights which role owns it ("Builder leads · others support").
- A shared join code (reuse the existing `JoinClass` infrastructure) so teammates land on the same project. Avoids real-time collab complexity but keeps everyone synced.

### 10. Deliverables dashboard + one-click export
Replace the "completion %" metaphor with a **Deliverables** view: a single page listing the 5 things the team must walk out with — problem statement, chosen idea, prototype link, pitch script, deck outline. Each row shows ✅ ready / ⏳ draft / ⛔ missing. One button: **"Export hackathon pack"** → a single PDF/Markdown bundle the team can submit to organizers. This is the artifact the whole 6 hours is optimized for.

---

## Technical Notes

- New file: `src/lib/hackathonMode.ts` — phase budgets, timer state in `localStorage` + project row.
- New context: `HackathonContext` wrapping `ProjectContext`, exposing `mode`, `phaseBudgets`, `timeRemaining`, `currentBlock`.
- New page: `src/pages/Pitch.tsx`; new page `src/pages/Deliverables.tsx`; new component `HackathonTimerBar`.
- Migration: add `hackathon_mode boolean`, `hackathon_started_at timestamptz`, `hackathon_duration_minutes int`, `team_size int`, `team_role text` to `projects`. Standard GRANTs + RLS via existing `is_project_owner`.
- Extend `supabase/functions/ai-assist/index.ts` with two new modes: `unstuck`, `challenge`, plus a `pitch_generate` mode that takes all prior step data and returns `{ script, slides[], checklist[] }` as JSON.
- Re-skin (not rewrite) `src/index.css` tokens for the higher-energy look; keep RTL + Hebrew throughout.
- Keep all existing 15 step pages working — Hackathon Mode is an overlay/router, not a rewrite. Users can still use "Classic Mode" if a teacher wants the full course.

---

## Out of Scope (intentionally)

- Real-time multi-cursor collaboration (too much for the value).
- Auth changes / new identity flows.
- Replacing the sketch UI everywhere — only the home + new blocks get the new look in v1.

---

Want me to build all 10, or pick a subset to ship first? If you want everything, I'd sequence it: **1 + 2 + 3 + 10** (the spine) → **8** (pitch) → **7** (Lovable handoff) → **5 + 6** (polish) → **4 + 9** (last).
