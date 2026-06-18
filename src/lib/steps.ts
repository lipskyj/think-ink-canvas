import { Heart, Layers, User, Target, HelpCircle, Search, Lightbulb, Film, FileText, Map, FlaskConical, Crosshair, ShieldCheck, FileOutput, Presentation, type LucideIcon } from "lucide-react";

export type ProcessPhase = "problem" | "solution" | "development";

export interface PhaseConfig {
  key: ProcessPhase;
  title: string;
  emoji: string;
}

export const PHASES: PhaseConfig[] = [
  { key: "problem", title: "הגדרת הבעיה", emoji: "🔍" },
  { key: "solution", title: "גיבוש הפתרון", emoji: "💡" },
  { key: "development", title: "פיתוח הפתרון", emoji: "🚀" },
];

export interface StepConfig {
  key: string;
  num: number;
  title: string;
  url: string;
  icon: LucideIcon;
  emoji: string;
  learnMoreUrl: string;
  phase: ProcessPhase;
  description: string;
  whyItMatters: string;
}

export const STEPS: StepConfig[] = [
  // ── שלב 1: הגדרת הבעיה ──
  {
    key: "empathy_map",
    num: 1,
    title: "מפת אמפתיה",
    url: "/empathy-map",
    icon: Heart,
    emoji: "💛",
    learnMoreUrl: "https://www.nngroup.com/articles/empathy-mapping/",
    phase: "problem",
    description: "מפת אמפתיה עוזרת לכם להיכנס לנעליים של המשתמש. על ידי מיפוי מה הוא אומר, חושב, עושה ומרגיש, אתם בונים הבנה משותפת של עולמו — ועוברים מהנחות לתובנות אמיתיות.",
    whyItMatters: "בלי אמפתיה, פתרונות נבנים על ניחושים. תרגיל זה מעגן את הצוות במציאות של המשתמש ומפחית את הסיכון לפתרון הבעיה הלא נכונה.",
  },
  {
    key: "converge",
    num: 2,
    title: "התכנסות",
    url: "/converge",
    icon: Layers,
    emoji: "🔗",
    learnMoreUrl: "https://www.interaction-design.org/literature/article/affinity-diagrams",
    phase: "problem",
    description: "התכנסות פירושה ארגון ממצאי מחקר מפוזרים לאשכולות משמעותיים. באמצעות דיאגרמת זיקה, אתם מקבצים תצפיות כדי לחשוף דפוסים ונושאים שאולי פספסתם.",
    whyItMatters: "נתונים גולמיים מציפים. שלב זה הופך כאוס לבהירות — ועוזר לכם לזהות נושאים מרכזיים שיעצבו את הגדרת הבעיה.",
  },
  {
    key: "user_persona",
    num: 2,
    title: "פרסונת משתמש",
    url: "/user-persona",
    icon: User,
    emoji: "👤",
    learnMoreUrl: "https://www.interaction-design.org/literature/article/personas-why-and-how-you-should-use-them",
    phase: "problem",
    description: "פרסונת משתמש היא דמות בדיונית אך מבוססת מחקר המייצגת את קבוצת המשתמשים המרכזית. היא לוכדת מטרות, תסכולים, התנהגויות והקשר בפרופיל תמציתי אחד.",
    whyItMatters: "פרסונות שומרות על הצוות מיושר לגבי למי אתם מעצבים. הן מונעות בעיית ה'משתמש הגמיש' — שבה כל אחד מדמיין אדם אחר.",
  },
  {
    key: "jtbd",
    num: 3,
    title: "משימות לביצוע",
    url: "/jtbd",
    icon: Crosshair,
    emoji: "🎯",
    learnMoreUrl: "https://jtbd.info/2-what-is-jobs-to-be-done-jtbd-796b82081c5",
    phase: "problem",
    description: "משימות לביצוע מעבירות את המיקוד ממה שהמוצר עושה למה שהמשתמש מנסה להשיג. אתם מגדירים את ה'משימות' הפונקציונליות, הרגשיות והחברתיות שהמשתמש 'שוכר' פתרון עבורן.",
    whyItMatters: "אנשים לא קונים מוצרים — הם שוכרים פתרונות. הבנת המשימה הבסיסית מונעת מכם לבנות תכונות שאף אחד לא צריך.",
  },
  {
    key: "pov_statement",
    num: 6,
    title: "הצהרת נקודת מבט",
    url: "/pov",
    icon: Target,
    emoji: "🎯",
    learnMoreUrl: "https://www.interaction-design.org/literature/article/define-and-frame-your-design-challenge-by-creating-your-point-of-view-and-ask-how-might-we",
    phase: "problem",
    description: "הצהרת נקודת מבט מזקקת את כל מה שלמדתם למשפט אחד ברור ופעיל: [משתמש] צריך [צורך] כי [תובנה]. זהו הגשר בין מחקר ליצירת רעיונות.",
    whyItMatters: "הצהרת POV מעוצבת היטב ממקדת את היצירתיות. בלעדיה, סיעור מוחות מתפזר לכל כיוון. איתה, כל רעיון ניתן להערכה מול צורך אנושי ברור.",
  },
  {
    key: "how_might_we",
    num: 7,
    title: "איך נוכל",
    url: "/hmw",
    icon: HelpCircle,
    emoji: "🤔",
    learnMoreUrl: "https://www.interaction-design.org/literature/topics/how-might-we",
    phase: "problem",
    description: "שאלות \"איך נוכל\" ממסגרות בעיות כהזדמנויות. הן רחבות מספיק כדי להזמין פתרונות יצירתיים, אך ספציפיות מספיק כדי להישאר ממוקדות בצרכי המשתמש.",
    whyItMatters: "הדרך שבה אתם ממסגרים בעיה קובעת את הפתרונות שתמצאו. שאלות ״איך נוכל״ פותחות חשיבה יצירתית תוך שמירה על עיגון בתובנות המשתמש.",
  },
  {
    key: "five_whys",
    num: 8,
    title: "חמישה למה",
    url: "/five-whys",
    icon: Search,
    emoji: "🔍",
    learnMoreUrl: "https://en.wikipedia.org/wiki/Five_whys",
    phase: "problem",
    description: "טכניקת חמישה למה חופרת מתחת לסימפטומים השטחיים על ידי שאילת 'למה?' שוב ושוב. כל תשובה מקלפת שכבה ומובילה לשורש הבעיה האמיתי.",
    whyItMatters: "פתרון סימפטומים מבזבז משאבים. טכניקה פשוטה אך עוצמתית זו מבטיחה שאתם מטפלים בגורם האמיתי — ולא רק מדביקים פלסטר.",
  },
  // ── שלב 2: גיבוש הפתרון ──
  {
    key: "ideation",
    num: 9,
    title: "יצירת רעיונות",
    url: "/ideation",
    icon: Lightbulb,
    emoji: "💡",
    learnMoreUrl: "https://www.interaction-design.org/literature/topics/ideation",
    phase: "solution",
    description: "יצירת רעיונות עוסקת ביצירת כמה שיותר רעיונות ללא שיפוט. כמות מובילה לאיכות — הרעיונות הטובים ביותר לרוב צצים אחרי שהמובנים מאליהם יצאו מהדרך.",
    whyItMatters: "קפיצה לפתרון הראשון היא הטעות העיצובית הנפוצה ביותר. יצירת רעיונות מובנית דוחפת אתכם מעבר לתשובות הברורות לטריטוריה חדשנית באמת.",
  },
  {
    key: "effort_impact",
    num: 10,
    title: "מטריצת מאמץ-השפעה",
    url: "/effort-impact",
    icon: Target,
    emoji: "📊",
    learnMoreUrl: "https://www.nngroup.com/articles/prioritization-matrices/",
    phase: "solution",
    description: "מטריצת מאמץ-השפעה עוזרת לכם לתעדף רעיונות לפי שני צירים: כמה מאמץ נדרש לביצוע, וכמה השפעה יהיה לפתרון. גררו את הרעיונות למקום הנכון על הגרף.",
    whyItMatters: "לא כל רעיון שווה. מטריצה זו חושפת את ה׳ניצחונות המהירים׳ — רעיונות עם השפעה גבוהה ומאמץ נמוך — ומונעת השקעה ברעיונות שלא יחזירו את ההשקעה.",
  },
  {
    key: "assumption_selection",
    num: 11,
    title: "הנחות",
    url: "/assumptions",
    icon: ShieldCheck,
    emoji: "🛡️",
    learnMoreUrl: "https://www.strategyzer.com/library/how-to-test-business-ideas",
    phase: "solution",
    description: "כל רעיון נושא הנחות סמויות. שלב זה שואל: מה חייב להיות נכון כדי שזה יעבוד? אתם מזהים, מתעדפים ומתכננים לבדוק קודם את ההנחות המסוכנות ביותר.",
    whyItMatters: "הנחות שלא נבדקו הן הסיבה מספר 1 לכישלון פרויקטים. על ידי חשיפה ובדיקה מוקדמת, אתם חוסכים שבועות של בנייה של משהו שאולי לא יעבוד.",
  },
  // ── שלב 3: פיתוח הפתרון ──
  {
    key: "storyboard",
    num: 12,
    title: "סטוריבורד",
    url: "/storyboard",
    icon: Film,
    emoji: "🎬",
    learnMoreUrl: "https://www.interaction-design.org/literature/topics/storyboards",
    phase: "development",
    description: "סטוריבורד מדמיין כיצד המשתמש יחווה את הפתרון בהקשר. באמצעות פריימים פשוטים, אתם משרטטים את המסע מהטריגר לתוצאה — והופכים רעיונות מופשטים למוחשיים.",
    whyItMatters: "רעיונות בראש תמיד נראים מושלמים. סטוריבורד מכריח אתכם לחשוב על החוויה האמיתית, ולחשוף פערים לפני שמשקיעים בבנייה.",
  },
  {
    key: "prototype_brief",
    num: 13,
    title: "בריף אב-טיפוס",
    url: "/prototype-brief",
    icon: FileText,
    emoji: "📄",
    learnMoreUrl: "https://www.interaction-design.org/literature/topics/prototyping",
    phase: "development",
    description: "בריף אב-טיפוס מגדיר מה תבנו, מה תבדקו וכיצד תמדדו הצלחה. זהו השרטוט שלכם ליצירת אב-טיפוס ממוקד וניתן לבדיקה — לא מוצר מלא.",
    whyItMatters: "בנייה בלי בריף מובילה לזחילת היקף ובזבוז מאמץ. בריף ברור שומר על אב-הטיפוס רזה ועל הבדיקה ממוקדת.",
  },
  {
    key: "user_testing",
    num: 14,
    title: "בדיקות משתמשים",
    url: "/user-testing",
    icon: FlaskConical,
    emoji: "🧪",
    learnMoreUrl: "https://www.interaction-design.org/literature/topics/usability-testing",
    phase: "development",
    description: "בדיקות משתמשים מציבות את אב-הטיפוס מול משתמשים אמיתיים כדי לצפות במה שעובד ומה לא. אתם יוצרים משימות, צופים במשתמשים מנסים לבצע אותן, ולוכדים משוב כנה ולא מסונן.",
    whyItMatters: "אתם לא המשתמש שלכם. בדיקות חושפות הפתעות שאף כמות של סקירה פנימית לא יכולה לחשוף — ומאמתות את הפתרון עם ראיות, לא דעות.",
  },
  {
    key: "prd_generator",
    num: 15,
    title: "PRD / פרומפט לקוד",
    url: "/prd",
    icon: FileOutput,
    emoji: "🚀",
    learnMoreUrl: "https://www.interaction-design.org/literature/topics/product-requirements-document",
    phase: "development",
    description: "שלב זה אוסף את כל העבודה שביצעתם לאורך התהליך ומייצר מסמך PRD (Product Requirements Document) — פרומפט מובנה ומוכן להדבקה במערכת text-to-code כמו Lovable.",
    whyItMatters: "מסמך PRD טוב הוא הגשר בין מחקר עיצוב לפיתוח. הוא מתרגם תובנות, פרסונות ורעיונות למפרט ברור שמערכת AI יכולה לבנות ממנו מוצר אמיתי.",
  },
];

export const TOTAL_STEPS = STEPS.length;

export function getStepByKey(key: string): StepConfig | undefined {
  return STEPS.find((s) => s.key === key);
}

export function getStepIndex(key: string): number {
  return STEPS.findIndex((s) => s.key === key);
}

export function getPreviousStep(key: string): StepConfig | undefined {
  const idx = getStepIndex(key);
  return idx > 0 ? STEPS[idx - 1] : undefined;
}

export function getNextStep(key: string): StepConfig | undefined {
  const idx = getStepIndex(key);
  return idx < STEPS.length - 1 ? STEPS[idx + 1] : undefined;
}

export function getPhaseSteps(phase: ProcessPhase): StepConfig[] {
  return STEPS.filter((s) => s.phase === phase);
}
