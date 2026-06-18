// Hackathon Mode: 4 sprint blocks built on top of the existing 15-step kit.
// Default duration: 6 hours. State is persisted in localStorage.

export type BlockKey = "problem" | "solution" | "build" | "pitch";

export interface SubStep {
  stepKey: string; // matches STEPS[i].key, or "pitch" / "deliverables"
  title: string;
  minutes: number;
  url: string;
  role: TeamRole;
}

export type TeamRole = "researcher" | "designer" | "builder" | "pitcher";

export const ROLE_LABEL: Record<TeamRole, string> = {
  researcher: "חוקר/ת",
  designer: "מעצב/ת",
  builder: "בונה",
  pitcher: "מציג/ה",
};

export interface SprintBlock {
  key: BlockKey;
  emoji: string;
  title: string;
  tagline: string;
  minutes: number; // total budget for the block
  color: string; // hsl
  deliverables: string[];
  leadRole: TeamRole;
  subSteps: SubStep[];
}

export const SPRINT_BLOCKS: SprintBlock[] = [
  {
    key: "problem",
    emoji: "",
    title: "הבעיה",
    tagline: "מי המשתמש, מה כואב, ולמה זה משנה",
    minutes: 60,
    color: "hsl(0, 70%, 55%)",
    leadRole: "researcher",
    deliverables: [
      "משפט בעיה ב-3 שורות",
      "משתמש/ת קונקרטי/ת",
      "תובנה אחת לא טריוויאלית",
    ],
    subSteps: [
      { stepKey: "empathy_map", title: "מפת אמפתיה מהירה", minutes: 20, url: "/empathy-map", role: "researcher" },
      { stepKey: "five_whys", title: "5 למה — לשורש", minutes: 15, url: "/five-whys", role: "researcher" },
      { stepKey: "pov_statement", title: "הצהרת בעיה (POV)", minutes: 15, url: "/pov", role: "researcher" },
    ],
  },
  {
    key: "solution",
    emoji: "",
    title: "הפתרון",
    tagline: "הרבה רעיונות. אחד שווה לבנות.",
    minutes: 60,
    color: "hsl(40, 90%, 55%)",
    leadRole: "designer",
    deliverables: [
      "5+ רעיונות גולמיים",
      "רעיון נבחר עם נימוק",
      "מה דורש הוכחה",
    ],
    subSteps: [
      { stepKey: "how_might_we", title: "מה אם...?", minutes: 5, url: "/hmw", role: "designer" },
      { stepKey: "ideation", title: "סופת רעיונות", minutes: 20, url: "/ideation", role: "designer" },
      { stepKey: "effort_impact", title: "מה לבנות עכשיו?", minutes: 10, url: "/effort-impact", role: "designer" },
    ],
  },
  {
    key: "build",
    emoji: "",
    title: "הבנייה",
    tagline: "דמו אמיתי, לא שקפים.",
    minutes: 180,
    color: "hsl(210, 80%, 55%)",
    leadRole: "builder",
    deliverables: [
      "סטוריבורד 4 פריימים",
      "דף הזמנה לבנייה",
      "אב-טיפוס שעובד",
    ],
    subSteps: [
      { stepKey: "storyboard", title: "סטוריבורד — 4 פריימים", minutes: 20, url: "/storyboard", role: "designer" },
      { stepKey: "prototype_brief", title: "דף הזמנה לבנייה", minutes: 10, url: "/prototype-brief", role: "builder" },
      { stepKey: "prd_generator", title: "PRD ← Lovable", minutes: 130, url: "/prd", role: "builder" },
    ],
  },
  {
    key: "pitch",
    emoji: "",
    title: "הפיץ׳",
    tagline: "מצגת אמיתית. 6 סגנונות. 60 שניות שמוכרות.",
    minutes: 60,
    color: "hsl(280, 70%, 60%)",
    leadRole: "pitcher",
    deliverables: [
      "מצגת PowerPoint להורדה",
      "סקריפט 60 שניות",
      "צ׳קליסט שיפוט",
    ],
    subSteps: [
      { stepKey: "pitch", title: "בניית הפיץ׳", minutes: 40, url: "/pitch", role: "pitcher" },
      { stepKey: "deliverables", title: "אריזה למסירה", minutes: 20, url: "/deliverables", role: "pitcher" },
    ],
  },
];

export function getBlock(key: BlockKey): SprintBlock {
  return SPRINT_BLOCKS.find((b) => b.key === key)!;
}

export function getBlockOfStep(stepKey: string): SprintBlock | undefined {
  return SPRINT_BLOCKS.find((b) => b.subSteps.some((s) => s.stepKey === stepKey));
}

export const DEFAULT_DURATION_MIN = 360; // 6h

// ── localStorage state ─────────────────────────────────────────────────
const KEY = "hackathon-mode-v1";

export interface LsdCacheEntry {
  sig: string;
  content: {
    learn: string;
    see: { context: string; execution: string };
    do: { objective: string; steps: string[]; formula: string };
  };
}

export interface HackathonState {
  enabled: boolean;
  startedAt: number | null; // ms epoch
  durationMin: number;
  teamSize: number;
  myRole: TeamRole | null;
  teamName: string;
  currentBlock: BlockKey;
  theme: string;
  lsdCache: Partial<Record<BlockKey, LsdCacheEntry>>;
}

export const DEFAULT_STATE: HackathonState = {
  enabled: false,
  startedAt: null,
  durationMin: DEFAULT_DURATION_MIN,
  teamSize: 4,
  myRole: null,
  teamName: "",
  currentBlock: "problem",
  theme: "",
  lsdCache: {},
};

export function loadHackathonState(): HackathonState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STATE;
}

export function saveHackathonState(s: HackathonState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function formatHMS(seconds: number): string {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  return `${sign}${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
