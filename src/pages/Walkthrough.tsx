import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowLeft, ArrowRight, Home, CheckCircle2, Play, Star, Quote } from "lucide-react";
import personaDana from "@/assets/persona-dana.png";

// Small reusable avatar of the persona — shown across steps so the story stays anchored to a real person
const PersonaChip = ({ size = "sm" }: { size?: "sm" | "md" }) => (
  <div className="inline-flex items-center gap-2 sketch-border-thin bg-background px-2 py-1 rounded-md">
    <img
      src={personaDana}
      alt="דנה — הפרסונה"
      className={size === "md" ? "w-10 h-10 object-cover rounded-sm" : "w-7 h-7 object-cover rounded-sm"}
      loading="lazy"
    />
    <span className="font-sketch text-sm">דנה, כיתה ט׳</span>
  </div>
);

// Reusable highlight box for "the chosen one" — the selection that propagates to the next step
const ChosenBox = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 relative bg-[hsl(var(--sun)/0.45)] sketch-border-thin p-3 pr-10">
    <Star className="absolute right-2 top-2 h-5 w-5 fill-foreground text-foreground" />
    <div className="font-hand text-base">{children}</div>
    <div className="text-[10px] font-sketch tracking-wider uppercase text-muted-foreground mt-1.5">
      ↓ זה מה שעובר לשלב הבא
    </div>
  </div>
);

interface DemoStep {
  num: number;
  phase: string;
  phaseColor: string;
  title: string;
  what: string; // what we do
  output: React.ReactNode; // the result
}

const DEMO_DATA: DemoStep[] = [
  {
    num: 1,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "פרסונת משתמש",
    what: "בונים דמות מייצגת שמסכמת מי המשתמש שלנו — שם, גיל, מטרות, תסכולים וציטוט אופייני.",
    output: (
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={personaDana}
          alt="דנה כהן"
          className="w-32 h-32 sm:w-40 sm:h-40 object-cover sketch-border-thin rounded-md shrink-0 bg-background"
          loading="lazy"
          width={512}
          height={512}
        />
        <div className="space-y-1.5 font-hand text-base flex-1">
          <p><strong>שם:</strong> דנה כהן</p>
          <p><strong>גיל:</strong> בת 15, תלמידת כיתה ט׳</p>
          <p><strong>תפקיד:</strong> תלמידת תיכון שמתקשה במתמטיקה, אוהבת אמנות ומוזיקה</p>
          <p><strong>מטרות:</strong> לעבור את מבחן המתמטיקה בלי להתבייש, להרגיש שאני מסוגלת</p>
          <p><strong>תסכולים:</strong> לא מבינה אלגברה כי המורה מסבירה מהר מדי. מתביישת לשאול שאלות לפני כולם</p>
          <p className="flex gap-2 italic border-r-2 border-foreground/40 pr-3 mt-3">
            <Quote className="h-4 w-4 shrink-0 mt-1" />
            "הלוואי שהיה לי מישהו שמסביר לי בלי לשפוט, בקצב שלי"
          </p>
        </div>
      </div>
    ),
  },
  {
    num: 2,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "מפת אמפתיה",
    what: "ארבעה רבעים שמתעדים מה היא חושבת, מרגישה, אומרת ועושה — וגם הכאבים וההישגים שלה.",
    output: (
      <div className="grid sm:grid-cols-2 gap-3 font-hand text-base">
        <div className="sketch-border-thin p-3 bg-background/50"><strong>חושבת:</strong> כולם מבינים חוץ ממני. מה יגידו עלי?</div>
        <div className="sketch-border-thin p-3 bg-background/50"><strong>מרגישה:</strong> חרדה לפני מבחנים, בושה בכיתה</div>
        <div className="sketch-border-thin p-3 bg-background/50"><strong>אומרת:</strong> "כן, אני מבינה" (גם כשלא). "לא צריכה עזרה"</div>
        <div className="sketch-border-thin p-3 bg-background/50"><strong>עושה:</strong> מעתיקה מחברים, גוגלת אחרי השיעור</div>
        <div className="sketch-border-thin p-3 bg-background/50 sm:col-span-2"><strong>כאבים:</strong> פחד מכישלון ובושה חברתית, חוסר ביטחון, תחושת פיגור</div>
        <div className="sketch-border-thin p-3 bg-background/50 sm:col-span-2"><strong>הישגים שמחפשת:</strong> להרגיש שהיא מבינה, לעבור את המבחן, ללמד חבר</div>
      </div>
    ),
  },
  {
    num: 3,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "חמישה למה",
    what: "שואלים 'למה' חמש פעמים כדי להגיע משורש הבעיה.",
    output: (
      <>
        <div className="flex items-center gap-2 mb-3"><PersonaChip /><span className="font-hand text-sm text-muted-foreground">— שואלים עליה למה</span></div>
        <ol className="space-y-2 font-hand text-base list-decimal pr-6">
          <li>ההסברים של המורה מהירים ולא מותאמים לכל תלמיד</li>
          <li>יש 35 תלמידים בכיתה ואין זמן לתשומת לב אישית</li>
          <li>תלמידים מתביישים לשאול שאלות בכיתה</li>
          <li>אין כלים ללמוד ולתרגל בקצב האישי, בבית</li>
          <li>הכלים הקיימים לא מותאמים לתוכנית הלימודים הישראלית</li>
        </ol>
        <ChosenBox>
          <strong>שורש הבעיה:</strong> אין פלטפורמת תרגול אישית בעברית שמאפשרת ללמוד ללא בושה, בקצב שלהם
        </ChosenBox>
      </>
    ),
  },
  {
    num: 4,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "הצהרת נקודת מבט (POV)",
    what: "ממקדים את כל מה שלמדנו במשפט אחד: [משתמש] צריך [צורך] כי [תובנה].",
    output: (
      <ChosenBox>
        <strong>דנה, תלמידת כיתה ט׳ שמתקשה באלגברה</strong>
        <span className="text-primary font-bold mx-2">צריכה</span>
        <strong>דרך לתרגל ולהבין מתמטיקה בלי לחץ חברתי</strong>
        <span className="text-primary font-bold mx-2">כי</span>
        <strong>היא מפחדת לשאול שאלות בכיתה ולא מוצאת הסברים מותאמים לתוכנית הישראלית.</strong>
      </ChosenBox>
    ),
  },
  {
    num: 5,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "איך נוכל (HMW)",
    what: "ממסגרים את הבעיה כהזדמנות פתוחה ליצירתיות.",
    output: (
      <>
        <ul className="space-y-2 font-hand text-base list-disc pr-6">
          <li>איך נוכל לעזור לתלמידים לתרגל מתמטיקה ללא בושה ובקצב שלהם?</li>
          <li>איך נוכל להפוך את לימוד האלגברה לחוויה כיפית ולא מאיימת?</li>
          <li>איך נוכל לספק הסבר אישי לכל תלמיד בלי מורה פרטי?</li>
        </ul>
        <ChosenBox>
          <strong>נבחר:</strong> איך נוכל לעזור לתלמידים לתרגל מתמטיקה ללא בושה ובקצב שלהם?
        </ChosenBox>
      </>
    ),
  },
  {
    num: 6,
    phase: "גיבוש הפתרון",
    phaseColor: "pill-chip-sun",
    title: "יצירת רעיונות",
    what: "מציפים הרבה רעיונות בלי לשפוט. כמות מובילה לאיכות.",
    output: (
      <ol className="space-y-1.5 font-hand text-base list-decimal pr-6">
        <li>אפליקציה עם AI שמסבירה בקצב אישי</li>
        <li>משחק שבו מתמטיקה היא כוח-על של גיבורים</li>
        <li>פלטפורמת תרגול אדפטיבית שמסתגלת לרמה</li>
        <li>בוט וואטסאפ שעונה על שאלות 24/7</li>
        <li>סרטוני הסבר קצרים בעברית עם גיבורת אנימציה</li>
        <li>מסלולי למידה מותאמים לפי מבחן אבחון</li>
        <li>מרחב לימוד מקוון עם שיתוף פעולה בין תלמידים</li>
      </ol>
    ),
  },
  {
    num: 7,
    phase: "גיבוש הפתרון",
    phaseColor: "pill-chip-sun",
    title: "מטריצת מאמץ-השפעה",
    what: "מתעדפים רעיונות לפי ציר מאמץ וציר השפעה — ובוחרים את הניצחונות המהירים.",
    output: (
      <>
        <div className="grid sm:grid-cols-2 gap-3 font-hand text-base">
          <div className="relative sketch-border-thin p-3 pr-9 bg-[hsl(var(--mint)/0.5)] ring-2 ring-foreground/40">
            <Star className="absolute right-2 top-2 h-4 w-4 fill-foreground text-foreground" />
            <strong>ניצחונות מהירים:</strong> מדריך ChatGPT לתלמידים, רשימת סרטוני יוטיוב בעברית
            <div className="text-[10px] font-sketch tracking-wider uppercase text-foreground/70 mt-1.5">
              ★ מתחילים מכאן — השפעה גבוהה, מאמץ נמוך
            </div>
          </div>
          <div className="sketch-border-thin p-3 bg-[hsl(var(--sun)/0.35)]">
            <strong>הימורים גדולים:</strong> אפליקציה עם AI מותאם לתוכנית הישראלית, משחק עולם מתמטי
          </div>
          <div className="sketch-border-thin p-3 bg-background/50">
            <strong>מילויים:</strong> בוט וואטסאפ סטטי, פורום תלמידים
          </div>
          <div className="sketch-border-thin p-3 bg-background/50">
            <strong>בזבזני זמן:</strong> משחק VR מלא, מורה רובוט פיזי
          </div>
        </div>
        <ChosenBox>
          <strong>בחרנו (הימור גדול עם פוטנציאל אמיתי):</strong> אפליקציה עם AI — תלמיד מצלם שאלה, ה-AI מסביר צעד-אחר-צעד ומוסיף תרגיל מותאם.
        </ChosenBox>
      </>
    ),
  },
  {
    num: 8,
    phase: "פיתוח הפתרון",
    phaseColor: "pill-chip-mint",
    title: "בריף אב-טיפוס",
    what: "כותבים חוזה קצר: מה בונים, למה, למי, ואיך נמדוד הצלחה.",
    output: (
      <div className="space-y-2 font-hand text-base">
        <p><strong>שם המוצר:</strong> MathMate</p>
        <p><strong>תיאור:</strong> אפליקציה ישראלית ללמידת מתמטיקה עם AI אישי. התלמיד מצלם שאלה מהמחברת, ה-AI מסביר צעד-אחר-צעד בעברית ומוסיף תרגילים מותאמים.</p>
        <p><strong>קהל יעד:</strong> תלמידי כיתות ח׳-י׳ המתקשים במתמטיקה</p>
        <p><strong>הצלחה:</strong> תלמיד מבין נושא תוך 20 דקות, 80% ביטחון מוגבר, ציון עולה ב-15 נקודות</p>
      </div>
    ),
  },
  {
    num: 9,
    phase: "פיתוח הפתרון",
    phaseColor: "pill-chip-mint",
    title: "MoSCoW — תיעדוף תכונות",
    what: "מחלקים את הפיצ'רים ל-Must / Should / Could / Won't כדי להגדיר MVP מעשי.",
    output: (
      <div className="grid sm:grid-cols-2 gap-3 font-hand text-base">
        <div className="sketch-border-thin p-3 bg-[hsl(var(--coral)/0.25)]">
          <strong>Must:</strong> סריקת שאלה, הסבר AI בעברית, תרגול אדפטיבי
        </div>
        <div className="sketch-border-thin p-3 bg-[hsl(var(--sun)/0.35)]">
          <strong>Should:</strong> מפת קונספטים ויזואלית
        </div>
        <div className="sketch-border-thin p-3 bg-[hsl(var(--mint)/0.35)]">
          <strong>Could:</strong> סימולציית בחינה
        </div>
        <div className="sketch-border-thin p-3 bg-background/50">
          <strong>Won't (לא בגרסה הזו):</strong> סוציאל, תחרות בין כיתות
        </div>
      </div>
    ),
  },
  {
    num: 10,
    phase: "פיתוח הפתרון",
    phaseColor: "pill-chip-mint",
    title: "PRD / פרומפט לקוד",
    what: "אוספים את כל החומר למסמך אחד — פרומפט מובנה שאפשר להדביק במערכת text-to-code.",
    output: (
      <pre className="whitespace-pre-wrap font-mono text-xs bg-background/70 sketch-border-thin p-3 max-h-72 overflow-y-auto leading-relaxed" dir="ltr">{`# MathMate — PRD

## Problem
40% of Israeli high-school students struggle with math.
No access to personal help, ashamed to ask in class.

## Solution
Personal AI tutor in Hebrew that explains step-by-step,
adapted to the Israeli curriculum.

## Key features
1. Scan question from notebook (OCR)
2. AI explanation in Hebrew, animated steps
3. Adaptive practice
4. Visual concept map
5. Exam simulation

## Build prompt
Build a React Native (RTL Hebrew) app. Main screen with
"Ask a question" button, AI explanation screen with steps,
practice screen with 3 adapted exercises, progress screen.
Colors: blue-purple. Backend: Firebase.`}</pre>
    ),
  },
  {
    num: 11,
    phase: "הצגת הפתרון",
    phaseColor: "pill-chip",
    title: "פיצ' והצגה",
    what: "הופכים הכול לסיפור משכנע — פתיחה, בעיה, פתרון, ולידציה, חזון.",
    output: (
      <div className="space-y-3 font-hand text-base">
        <div className="bg-[hsl(var(--coral)/0.2)] sketch-border-thin p-3">
          <strong>Elevator pitch:</strong> בישראל, 40% מתלמידי התיכון נכשלים במתמטיקה — לא כי הם לא חכמים, אלא כי בכיתה של 35 אין מי שיסביר אישית. אנחנו בנינו MathMate — AI אישי שמסביר בעברית 24/7. כמו מורה פרטי בכיס, בחינם.
        </div>
        <ul className="space-y-1.5 list-disc pr-6">
          <li>🔴 הבעיה: 1 מכל 3 תלמידים לא עובר מתמטיקה</li>
          <li>👧 הפרסונה: דנה — מתביישת לשאול, אין כסף למורה פרטי</li>
          <li>💡 הפתרון: מצלמים שאלה → AI בעברית → תרגיל מותאם</li>
          <li>📊 ולידציה: 20 תלמידים נבדקו, 85% הרגישו ביטחון מוגבר</li>
          <li>🎯 יתרון: היחיד שמותאם לתוכנית הישראלית</li>
          <li>🚀 חזון: עד 2027 — מורה פרטי AI לכל ילד בישראל</li>
        </ul>
      </div>
    ),
  },
  {
    num: 12,
    phase: "הצגת הפתרון",
    phaseColor: "pill-chip",
    title: "הגשה לגלריה",
    what: "מעלים את המצגת ואת קישור הפיתוח לגלריה המשותפת — כל הקבוצות במקום אחד.",
    output: (
      <div className="space-y-3 font-hand text-base">
        <div className="sketch-border-thin p-3 bg-background/50 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <span>קישור למצגת: <span className="underline">mathmate-deck.pdf</span></span>
        </div>
        <div className="sketch-border-thin p-3 bg-background/50 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <span>קישור לאפליקציה: <span className="underline">mathmate.lovable.app</span></span>
        </div>
        <p className="text-muted-foreground">זהו — סיימתם את כל 12 השלבים. כל הכבוד! 🎉</p>
      </div>
    ),
  },
];

export default function Walkthrough() {
  const [idx, setIdx] = useState(0);
  const step = DEMO_DATA[idx];
  const total = DEMO_DATA.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="text-center mb-8">
          <span className="pill-chip pill-chip-coral mb-3 inline-block">דוגמה מקצה לקצה</span>
          <h1 className="display-huge mb-2">איך נראה תהליך שלם?</h1>
          <p className="font-hand text-lg text-muted-foreground">
            צופים בקבוצה שעוברת מבעיה ("תלמידים נכשלים במתמטיקה") עד להגשת אפליקציה. שלב אחרי שלב.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6 flex-wrap">
          {DEMO_DATA.map((s, i) => (
            <button
              key={s.num}
              onClick={() => setIdx(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === idx
                  ? "w-8 bg-foreground"
                  : i < idx
                  ? "w-2.5 bg-foreground/60"
                  : "w-2.5 bg-foreground/20"
              }`}
              aria-label={`שלב ${s.num}`}
              title={s.title}
            />
          ))}
        </div>

        {/* Step card */}
        <div className="sketch-card p-6 md:p-8 mb-6 bg-background animate-fade-in" key={step.num}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`pill-chip ${step.phaseColor}`}>{step.phase}</span>
            <span className="pill-chip pill-chip-outline">שלב {step.num} מתוך {total}</span>
          </div>
          <h2 className="display-huge mb-3">{step.title}</h2>
          <p className="font-hand text-lg text-foreground/75 mb-5 leading-snug">
            <strong>מה עושים:</strong> {step.what}
          </p>
          <div className="sketch-border-thin p-4 md:p-5 bg-secondary/30">
            <div className="text-xs font-sketch tracking-wider uppercase text-muted-foreground mb-3">
              מה הקבוצה כתבה
            </div>
            {step.output}
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="sketch-btn-outline inline-flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4" />
            הקודם
          </button>

          {idx === total - 1 ? (
            <Link to="/" className="sketch-btn inline-flex items-center gap-2">
              <Home className="h-4 w-4" /> חזרה למפת השלבים
            </Link>
          ) : (
            <button
              onClick={() => setIdx(Math.min(total - 1, idx + 1))}
              className="sketch-btn inline-flex items-center gap-2"
            >
              סיימתי, המשך הלאה
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/user-persona" className="sketch-btn-outline inline-flex items-center gap-2">
            <Play className="h-4 w-4" /> מוכנים? התחילו תהליך אמיתי משלכם
          </Link>
        </div>
      </div>
    </Layout>
  );
}
