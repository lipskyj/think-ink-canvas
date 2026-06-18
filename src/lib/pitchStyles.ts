// 6 pitch styles teens can pick from. Each style changes the slide structure
// and the system prompt sent to the AI.

export type PitchStyleKey =
  | "classic"
  | "story"
  | "demo"
  | "compare"
  | "vision"
  | "data";

export interface PitchStyle {
  key: PitchStyleKey;
  emoji: string;
  title: string;
  subtitle: string;
  whenToUse: string;
  slideTitles: string[]; // ordered list of slide titles in Hebrew
  promptHint: string; // extra instructions for the AI
}

export const PITCH_STYLES: PitchStyle[] = [
  {
    key: "classic",
    emoji: "🎯",
    title: "קלאסי",
    subtitle: "בעיה → פתרון",
    whenToUse: "מתאים לרוב התחרויות. בטוח, מובן, אי אפשר לטעות.",
    slideTitles: [
      "מי אנחנו",
      "הבעיה",
      "מי המשתמש",
      "הפתרון",
      "דמו חי",
      "למה זה ינצח",
    ],
    promptHint:
      "Structure: hook → problem → user → insight → solution → demo → ask. Energetic, confident.",
  },
  {
    key: "story",
    emoji: "💔",
    title: "סיפור אישי",
    subtitle: "רגש קודם, לוגיקה אחר כך",
    whenToUse: "כשהבעיה רגשית/חברתית — בריאות נפש, בדידות, נגישות.",
    slideTitles: [
      "תכירו את ___",
      "היום שלה/שלו",
      "רגע השבר",
      "מה אם היה אחרת?",
      "הפתרון שלנו",
      "ה-ASK",
    ],
    promptHint:
      "Open with a named single user (use the persona name if available). Tell their day in 1-2 sentences. Hit the breaking point. Reveal the solution as relief. Emotional, cinematic.",
  },
  {
    key: "demo",
    emoji: "🎬",
    title: "דמו ראשון",
    subtitle: "תראו, אל תספרו",
    whenToUse: "כשהמוצר ויזואלי ויש דמו שעובד וואו.",
    slideTitles: [
      "צפו ב-30 שניות",
      "מה ראיתם?",
      "הבעיה שזה פותר",
      "המשתמש",
      "איך זה עובד",
      "מה הלאה",
    ],
    promptHint:
      "Slide 1 is intentionally near-empty — just 'WATCH'. The presenter does a live 30s demo. Then slides explain what was just seen. Tone: confident, dry, let the product speak.",
  },
  {
    key: "compare",
    emoji: "⚖️",
    title: "השוואתי",
    subtitle: "ככה היום / ככה איתנו",
    whenToUse: "כשאתם משפרים תהליך שכבר קיים. השוואה ויזואלית.",
    slideTitles: [
      "ככה זה היום",
      "כמה זה כואב",
      "ככה איתנו",
      "ההבדל במספרים",
      "דמו",
      "ה-ASK",
    ],
    promptHint:
      "Every slide should have a 'before vs after' framing. Bullets in pairs: 'היום: X / איתנו: Y'. Sharp, contrast-heavy.",
  },
  {
    key: "vision",
    emoji: "🚀",
    title: "חזון נועז",
    subtitle: "תמונת עולם → הצעד הראשון",
    whenToUse: "כשהרעיון רחב, עתידי, או משנה תפיסה.",
    slideTitles: [
      "ב-2030...",
      "למה זה לא קורה היום",
      "מה צריך להשתנות",
      "הצעד הראשון שלנו",
      "דמו",
      "הצטרפו אלינו",
    ],
    promptHint:
      "Open with a bold future scenario (1 sentence, present tense — 'In 2030, every teenager has...'). Then crash to today's reality. Position the team as the first move toward the future. Inspiring but not fluffy.",
  },
  {
    key: "data",
    emoji: "📊",
    title: "דאטה-פאנץ׳",
    subtitle: "מספר שמכה → סיפור",
    whenToUse: "כשיש סטטיסטיקה חזקה או שוק גדול.",
    slideTitles: [
      "מספר אחד",
      "מאחורי המספר",
      "המשתמש שמייצג את המספר",
      "הפתרון שלנו",
      "איך נמדוד הצלחה",
      "ה-ASK",
    ],
    promptHint:
      "Slide 1 must be ONE big number/stat (real if available from research data, otherwise a realistic estimate the user can fact-check). Subsequent slides unpack it. If no stats in data, invent a plausible one and flag it with [verify].",
  },
];

export const getPitchStyle = (key: string | null | undefined): PitchStyle => {
  return PITCH_STYLES.find((s) => s.key === key) || PITCH_STYLES[0];
};
