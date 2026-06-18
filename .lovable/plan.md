## Goal
Keep the **Learn / See / Do** terminology front-and-center (it's our pedagogical language), and replace the current "boring" intro modal with a Gen-Z, motion-rich experience.

## Pedagogical language — keep it explicit
Across `StepIntroModal.tsx` and any related copy, always use the words **Learn**, **See**, **Do** as labels (English, big, bold). The Hebrew sub-copy stays for the body, but the stage names themselves remain Learn / See / Do — no more "רגע למחשבה" / "ככה זה נראה בשטח" replacements. Header chip reads e.g. `📖 LEARN · שלב 4 · HMW`.

## Visual direction — Gen-Z motion-first
Reskin `StepIntroModal.tsx` only. No changes to logic, hooks, edge function, or step pages.

1. **Backdrop**
   - Replace flat `bg-background/95` with an animated **mesh gradient**: 3–4 large blurred blobs (primary / accent / pink / lime) drifting in slow loops behind a translucent layer (`backdrop-blur-xl`).
   - Subtle noise/grain overlay for texture.

2. **Stage name treatment (LEARN / SEE / DO)**
   - Huge display word (clamp ~64–120px), set in our `font-sketch`, with an **animated conic/linear gradient text fill** that slowly hue-rotates (CSS `@keyframes hue` on `background-position` + `filter: hue-rotate`).
   - Active stage is solid-gradient; inactive stages render as **transparent outlined text** (`-webkit-text-stroke`) so they still read as Learn / See / Do but recede.
   - Stage tracker becomes a big horizontal row at the top: `LEARN → SEE → DO` with the active word scaled up and color-shifting.

3. **Typewriter reveal**
   - New tiny component `TypewriterText` (inside the modal file, no new file unless needed): reveals the `learn` paragraph / `see.execution` paragraph character-by-character (~18ms/char, configurable, respects `prefers-reduced-motion` → instant).
   - Blinking caret `▍` at the cursor, in accent color.
   - A "skip animation" tap anywhere on the text completes it instantly.
   - Re-runs when the stage changes (learn → see).

4. **Card / container**
   - Drop the `sketch-border` box for the body text. Use a translucent glass panel: `bg-foreground/[0.03] backdrop-blur-md border border-foreground/10`, large radius, soft inner glow.
   - Body text larger, looser leading, more breathing room.

5. **Controls**
   - Bigger pill buttons. Primary CTA uses the same animated gradient as the title.
   - "דלג והתחל לעבוד" stays top-left but smaller/ghost.
   - On the final stage the CTA reads `🛠️ DO →` (keeping the term).

6. **Motion details**
   - Stage transitions: outgoing word slides up + fades, incoming word scales in from 0.9 with a slight blur-out.
   - Floating emoji/sparkle accents (✦, ✺) drifting in the corners.
   - All animations CSS-only (keyframes already supported in `tailwind.config.ts`); add a couple of new keyframes (`gradient-pan`, `blob-drift`, `caret-blink`) either in `tailwind.config.ts` or as a local `<style>` block inside the modal to avoid touching global CSS.

## Out of scope
- No changes to `useStepLSD`, the edge function, fallback content, or any step page.
- No new dependencies (no framer-motion) — pure Tailwind + CSS keyframes.
- The non-modal app UI is untouched in this pass.

## Files touched
- `src/components/StepIntroModal.tsx` — rewrite presentation, add `TypewriterText` helper + local keyframes.
- (optional) `tailwind.config.ts` — register `gradient-pan`, `blob-drift`, `caret-blink` keyframes if we want them reusable; otherwise inline.

## Open question
Animated gradient palette: do you want **(a) brand-tonal** (primary → accent only, monochrome-ish, fits the current zine aesthetic) or **(b) full Gen-Z neon** (hot pink / electric lime / cyan / violet) breaking from the monochrome sketch look just for the intro modal?
