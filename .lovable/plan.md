## QA review — 8 things to fix

After walking the flows end-to-end (home → join → team → 15 steps → pitch → submissions → admin), these are the highest-impact issues. Ranked by how much they hurt the experience.

---

### 1. "סיטואציה" textbox is unnecessary friction (Team page)
Same issue as the example you flagged. The textarea + 6 chip buttons let users invent free-form situations that the AI often ignores anyway. The chips alone are enough — like the avatar-style picker.

**Fix:** remove the textarea. The 6 situation chips become single-select pills (one highlighted). Selection feeds directly into `generate`.

---

### 2. `window.prompt` for the group edit code is a hard regression
On Index.tsx the ✏️ button uses a native browser `prompt()`. It breaks RTL, ignores the design system, can't be styled, and on iOS Safari it sometimes won't appear at all.

**Fix:** replace with a small shadcn `Dialog` containing a sketch-styled code input + "המשך / ביטול" buttons. Same logic, no native popup.

---

### 3. Leader/identity model is broken after the auto-join change
`JoinClass` now sets `isLeader: true` for **everyone** who opens a `/join/:id` link, and uses `leader_name || student_names[0]` as the studentName. Result:
- A real student opening a shared link silently becomes "leader" with someone else's name.
- The "rename group" / "only leader can save" guard becomes meaningless.
- `student_names` is never appended for new joiners, so the roster on the home page stops growing.

**Fix:** keep the auto-redirect to `/team`, but on Team show a one-time "what's your name?" inline prompt the first time `session.studentName` is empty. First person to land becomes leader; later joiners are appended to `student_names` and marked non-leader.

---

### 4. Admin "secret code" leaks in the URL & UI copy
The join code is the only auth for editing a group, yet:
- It's printed on the admin card and embedded in the copied link (`/join/<id>` exposes the id, and the code is shown in plain text to whoever has admin access).
- Anyone who briefly sees a screen-share of the homepage edit prompt sees the format (`A6`, 2 chars) — guessable space is ~1,300 combos.

**Fix:** lengthen `join_code` to 6 alphanumerics on new classes, and stop rendering it as plain text in the admin list — show "•••• [העתק]" with a reveal-on-click. Rate-limit the home prompt to 5 attempts per session.

---

### 5. PrototypeBrief auto-seed runs every render once the user clears the board
The new `useEffect` keys off `suggestedFeatures.length`. The moment a user deletes the last suggestion, the effect re-fires and re-injects all ideation items — they can't actually empty the column.

**Fix:** seed once, persist a `seeded: true` flag in the saved step data, and gate the effect on it. Add a "טען מחדש מהשלבים הקודמים" button so users can opt back in.

---

### 6. Avatar generation has no failure UI and no cost guard
- Errors only show as a toast, but the spinner state can get stuck if the edge function times out (no `finally` race on network abort).
- Nothing throttles a leader from clicking "צייר מחדש" 30 times — each call hits the paid AI gateway.
- Generated base64 PNG is stored directly on `classes.team_avatar_url` (data URL, can be 800KB+ per row).

**Fix:** add a 10s client timeout + retry button, debounce regenerate to 1/5s, and upload the PNG to a Supabase storage bucket, storing only the public URL on the row.

---

### 7. Homepage hero collapses on mobile
`clamp(4rem, 12vw, 9.5rem)` for the event topic + three giant "sketch-card" pills wrap into a 4-row stack on phones, pushing the actual "process" section below the fold. The organizer logo (`h-32`) eats another 200px on top.

**Fix:** mobile breakpoint variant — topic `clamp(2.5rem, 9vw, 5rem)`, pills shrink to icon + value only, logo caps at `h-20` under `sm:`. Keep the festive size on desktop.

---

### 8. Accessibility & RTL gaps across step pages
Quick scan found:
- Drag-and-drop in Brief / Effort-Impact has no keyboard alternative.
- Several `<button>`s with only an icon (Pencil on group cards, X on member rows, Crown chip) have no `aria-label`.
- Inputs inside `sketch-card` rely on placeholder-as-label — screen readers announce nothing once the user types.
- The hand-drawn font drops to ~3:1 contrast on `bg-secondary/30` — fails WCAG AA for body text.

**Fix:** add `aria-label` everywhere icon-only, promote placeholders to real `<label>`s (visually hidden where the design demands it), add keyboard sort buttons next to each draggable card, and bump muted-foreground one shade darker in `index.css`.

---

## Suggested implementation order

```
sprint 1 (UX wins, low risk)
  1. Situation chips           — Team.tsx
  2. Dialog for edit code      — Index.tsx + new component
  7. Mobile hero               — Index.tsx
  5. Brief auto-seed guard     — PrototypeBrief.tsx

sprint 2 (correctness)
  3. Identity / leader model   — JoinClass + Team + ClassContext
  6. Avatar storage + throttle — Team.tsx + new storage bucket migration
  4. Code hardening            — migration + Admin.tsx + Index.tsx

sprint 3 (a11y polish)
  8. aria-labels, labels, contrast pass
```

## Technical details

- **Storage bucket** for avatars: `team-avatars`, public read, authenticated insert via edge function; migrate existing data URLs lazily on next save.
- **Join code length** change is non-breaking — old 2-char codes keep working; only new inserts get 6 chars.
- **Identity prompt** uses `localStorage` keyed by `classId` so a returning student keeps the same name without re-asking.
- **Mobile hero** uses Tailwind responsive prefixes only, no JS branching.
- **Drag a11y** can be solved with `@dnd-kit/sortable` keyboard sensor if not already present, or simple "↑ / ↓ / bucket" buttons rendered on focus.

Want me to tackle all 8, or pick the sprints / specific items you care about first?
