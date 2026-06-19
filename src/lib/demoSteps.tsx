import { CheckCircle2, Quote, Star } from "lucide-react";
import personaDana from "@/assets/persona-dana.png";

export interface DemoStep {
  stepKey: string;
  num: number;
  phase: string;
  phaseColor: string;
  title: string;
  what: string;
  /** Improved, concrete "learn" explanation in Hebrew — replaces the generic one in the intro modal. */
  learn: string;
  /** Rendered example output (what the demo team produced for that step). */
  output: React.ReactNode;
}

// Small reusable avatar of the persona
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

// Highlight box for "the chosen one" that propagates to the next step
const ChosenBox = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 relative bg-[hsl(var(--sun)/0.45)] sketch-border-thin p-3 pr-10">
    <Star className="absolute right-2 top-2 h-5 w-5 fill-foreground text-foreground" />
    <div className="font-hand text-base">{children}</div>
    <div className="text-[10px] font-sketch tracking-wider uppercase text-muted-foreground mt-1.5">
      ↓ זה מה שעובר לשלב הבא
    </div>
  </div>
);

export const DEMO_STEPS: DemoStep[] = [
  {
    stepKey: "user_persona",
    num: 1,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "פרסונת משתמש",
    what: "בונים דמות מייצגת שמסכמת מי המשתמש שלנו — שם, גיל, מטרות, תסכולים וציטוט אופייני.",
    learn:
      "פרסונה היא לא 'משתמש ממוצע' — היא אדם ספציפי אחד שתמיד תוכלו לדמיין. במקום לכתוב 'משתמשי תיכון', אתם כותבים 'דנה, בת 15, מתביישת לשאול במתמטיקה'. ברגע שיש לכם דמות עם שם, ציטוט וכאב מוחשי — כל החלטה בהמשך נהיית קלה: 'דנה הייתה לוחצת על זה?'. בלי פרסונה — אתם מעצבים לאף אחד.",
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
    stepKey: "empathy_map",
    num: 2,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "מפת אמפתיה",
    what: "ארבעה רבעים שמתעדים מה היא חושבת, מרגישה, אומרת ועושה — וגם הכאבים וההישגים שלה.",
    learn:
      "פרסונה מספרת לכם מי האדם — מפת האמפתיה נכנסת לו לראש. הפער בין מה שהוא אומר ('אני מבינה') למה שהוא חושב ('אין לי מושג') הוא בדיוק המקום שבו פתרונות אמיתיים מתחבאים. מלאו ציטוטים אמיתיים, לא תיאורים מנומסים. ככל שהציטוט יותר לא נוח — יותר אמיתי, ויותר שווה.",
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
    stepKey: "five_whys",
    num: 3,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "חמש למה",
    what: "שואלים 'למה' חמש פעמים כדי להגיע משורש הבעיה.",
    learn:
      "כמעט כל צוות עוצר ב'למה' השני — שם נמצאת התשובה הברורה. אבל הזהב מתחיל ב'למה' השלישי, רביעי וחמישי, כשנגמרות לכם התשובות המוכנות. כל תשובה צריכה להתחיל ב'כי' ולעורר 'למה?' חדש. אם עצרתם כי 'כי ככה זה' — תחפרו עוד צעד אחד. שם מתחבאת הבעיה האמיתית שכדאי לפתור. טיפ: לא חייבים חמש למה בדיוק — שלושה עמוקים שווים יותר מחמישה שטחיים.",
    output: (
      <>
        <div className="sketch-border-thin p-3 bg-[hsl(var(--coral)/0.2)] mb-4 font-hand text-base">
        <strong>הסימפטום (נקודת ההתחלה):</strong> דנה לא מצליחה להבין מתמטיקה ולשפר את ציוניה
      </div>
      <div className="flex items-center gap-2 mb-3"><PersonaChip /><span className="font-hand text-sm text-muted-foreground">— שואלים עליה למה</span></div>
        <div className="space-y-3 font-hand text-base">
          <div className="sketch-border-thin p-3 bg-background/50">
            <div><strong>1.</strong> כי ההסברים של המורה מהירים ולא מותאמים לכל תלמיד.</div>
            <div className="text-sm text-muted-foreground mt-1">↩ למה?</div>
          </div>
          <div className="sketch-border-thin p-3 bg-background/50">
            <div><strong>2.</strong> כי יש 35 תלמידים בכיתה ואין זמן לתשומת לב אישית.</div>
            <div className="text-sm text-muted-foreground mt-1">↩ למה?</div>
          </div>
          <div className="sketch-border-thin p-3 bg-background/50">
            <div><strong>3.</strong> כי תלמידים מתביישים לשאול שאלות בכיתה.</div>
            <div className="text-sm text-muted-foreground mt-1">↩ למה?</div>
          </div>
          <div className="sketch-border-thin p-3 bg-background/50">
            <div><strong>4.</strong> כי אין כלים ללמוד ולתרגל בקצב האישי, בבית.</div>
            <div className="text-sm text-muted-foreground mt-1">↩ למה?</div>
          </div>
          <div className="sketch-border-thin p-3 bg-background/50">
            <div><strong>5.</strong> כי הכלים הקיימים לא מותאמים לתוכנית הלימודים הישראלית.</div>
          </div>
        </div>
        <ChosenBox>
          <strong>שורש הבעיה:</strong> אין פלטפורמת תרגול אישית בעברית שמאפשרת ללמוד ללא בושה, בקצב שלהם
        </ChosenBox>
      </>
    ),
  },
  {
    stepKey: "pov_statement",
    num: 4,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "הצהרת נקודת מבט (POV)",
    what: "ממקדים את כל מה שלמדנו במשפט אחד: [משתמש] צריך [צורך] כי [תובנה].",
    learn:
      "ה-POV הוא בית-ספר של משמעת. כל המחקר שעשיתם נדחס למשפט אחד — וכל הפתרונות שתמציאו בהמשך חייבים לשרת את המשפט הזה. ה'צריך' זה לא פיצ׳ר, זה צורך אנושי. ה'כי' זה לא תיאור, זו תובנה מפתיעה. אם משפט ה-POV נשמע לכם מובן מאליו — תחזרו אחורה, פספסתם את התובנה האמיתית.",
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
    stepKey: "how_might_we",
    num: 5,
    phase: "הגדרת הבעיה",
    phaseColor: "pill-chip-coral",
    title: "איך נוכל (HMW)",
    what: "ממסגרים את הבעיה כהזדמנות פתוחה ליצירתיות.",
    learn:
      "'איך נוכל' זה גשר: מצד אחד הבעיה (POV), מצד שני מאות פתרונות אפשריים. שאלה טובה לא רחבה מדי ('איך נוכל להציל את החינוך') ולא צרה מדי ('איך נוכל לעשות אפליקציה למתמטיקה'). היא במקום המתוק — מספיק פתוחה כדי להפתיע, מספיק ממוקדת כדי לפעול. כתבו 3-5 וריאציות ובחרו את זו שגורמת לכם להגיד 'אה, מעניין'.",
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
    stepKey: "ideation",
    num: 6,
    phase: "גיבוש הפתרון",
    phaseColor: "pill-chip-sun",
    title: "יצירת רעיונות",
    what: "מציפים הרבה רעיונות בלי לשפוט. כמות מובילה לאיכות.",
    learn:
      "הרעיון הראשון הוא תמיד הכי משעמם — הוא ברור, כולם חושבים עליו. הרעיון השלישי כבר מעניין. הרעיון העשירי לפעמים מטופש, אבל הוא פותח דלת לרעיון 11 שהוא גאוני. הכלל היחיד: לא שופטים בזמן הסבב. אפילו 'זה לא יעבוד' אסור. תרשמו את הכל, גם את הרעיון הכי גרוע — לפעמים ההפך שלו הוא הזוכה.",
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
    stepKey: "effort_impact",
    num: 7,
    phase: "גיבוש הפתרון",
    phaseColor: "pill-chip-sun",
    title: "מטריצת מאמץ-השפעה",
    what: "מתעדפים רעיונות לפי ציר מאמץ וציר השפעה — ובוחרים את הניצחונות המהירים.",
    learn:
      "כל רעיון נראה גאוני עד שמתחילים לבנות אותו. המטריצה הזו מאלצת אתכם להיות כנים: כמה זה באמת ישפיע על המשתמש? וכמה זה באמת יעלה לנו? הניצחונות המהירים (השפעה גבוהה, מאמץ נמוך) הם תמיד הבחירה הנכונה לפיילוט. ההימורים הגדולים הם בשבילכם רק אם יש לכם זמן, כסף וסבלנות לסיכון.",
    output: (
      <>
        <div className="grid sm:grid-cols-2 gap-3 font-hand text-base">
          <div className="relative sketch-border-thin p-3 pr-9 bg-[hsl(var(--mint)/0.5)]">
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
    stepKey: "prototype_brief",
    num: 8,
    phase: "פיתוח הפתרון",
    phaseColor: "pill-chip-mint",
    title: "בריף אב-טיפוס",
    what: "כותבים חוזה קצר: מה בונים, למה, למי, ואיך נמדוד הצלחה.",
    learn:
      "בריף הוא חוזה שאתם חותמים עם עצמכם לפני שכותבים שורת קוד אחת. הוא עונה על 4 שאלות בלבד: מה? למה? למי? איך נדע שזה הצליח? אם הצוות שלכם לא מסוגל לענות על אחת מהן — אתם לא מוכנים לבנות. בריף קצר וברור הוא הסיבה היחידה שאב-טיפוס יוצא בזמן ובלי זחילת היקף.",
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
    stepKey: "moscow_prioritization",
    num: 9,
    phase: "פיתוח הפתרון",
    phaseColor: "pill-chip-mint",
    title: "MoSCoW — תיעדוף תכונות",
    what: "מחלקים את הפיצ'רים ל-Must / Should / Could / Won't כדי להגדיר MVP מעשי.",
    learn:
      "MVP טוב הוא לא 'גרסה קטנה של המוצר' — הוא 'הדבר הכי קטן שמוכיח את ההנחה הכי מסוכנת שלכם'. כל פיצ׳ר שאתם דוחפים ל-Must חייב להיות חיוני: אם נמחק אותו, המוצר לא עובד. ה-Won't הוא הכי חשוב ברשימה — הוא מגן עליכם מלהתפזר. כתבו אותו בגאווה.",
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
    stepKey: "prd_generator",
    num: 10,
    phase: "פיתוח הפתרון",
    phaseColor: "pill-chip-mint",
    title: "PRD / פרומפט לקוד",
    what: "אוספים את כל החומר למסמך אחד בעברית — מסמך אפיון מובנה שאפשר להעביר למפתחים או להדביק בכלי text-to-code.",
    learn:
      "ה-PRD הוא רגע האמת — כל המחקר, הפרסונה, ה-POV, הרעיונות וה-MVP מתאחדים למסמך אחד. מסמך טוב גם אדם וגם AI יבינו בקריאה אחת: בעיה, משתמשת, פתרון, פיצ׳רים, מדדים. הסוד: לכתוב בו רק מה שכבר החלטתם — לא לפתוח דיונים חדשים. אם משהו לא ברור, חזרו אחורה לשלב שבו זה היה צריך להיות מוחלט.",
    output: (
      <pre className="whitespace-pre-wrap font-mono text-xs bg-background/70 sketch-border-thin p-3 max-h-80 overflow-y-auto leading-relaxed text-right" dir="rtl">{`# MathMate — מסמך אפיון מוצר (PRD)

## הבעיה
40% מתלמידי התיכון בישראל מתקשים במתמטיקה.
בכיתה של 35 תלמידים אין זמן להסבר אישי, ושיעור פרטי
עולה 150 ₪ לשעה — מחיר שרוב המשפחות לא יכולות לעמוד בו.
התלמידים מתביישים לשאול בכיתה, ונשארים מאחור בשקט.

## המשתמשת
דנה, בת 15, כיתה ט׳. אוהבת אמנות ומוזיקה, מתקשה
באלגברה, מתביישת לשאול לפני כולם.
"הלוואי שהיה לי מישהו שמסביר לי בלי לשפוט, בקצב שלי."

## הפתרון
מורה פרטי AI אישי בעברית. דנה מצלמת שאלה מהמחברת,
ה-AI מסביר צעד-אחר-צעד בקצב שלה, ומציע 3 תרגילי
חימום מותאמים לרמה — הכל מותאם לתוכנית הלימודים
של משרד החינוך הישראלי.

## פיצ׳רים עיקריים (MVP)
1. סריקת שאלה מהמחברת (OCR בעברית + סימנים מתמטיים)
2. הסבר AI שלב-אחר-שלב בעברית, עם אנימציה של הפתרון
3. תרגול אדפטיבי — קושי משתנה לפי ביצועי התלמיד
4. מד התקדמות אישי לפי נושאים בתוכנית הלימודים
5. "שאל שוב, אחרת" — מבקש מהמודל הסבר חלופי

## מדדי הצלחה
- 80% מהתלמידים מבינים נושא חדש תוך 20 דקות
- עלייה ממוצעת של 15 נקודות בציון מבחן בית
- 70% מדווחים על ירידה בחרדת מבחנים
- 1,000 תלמידים פעילים חודשית עד סוף שנה א׳

## פרומפט לכלי פיתוח
בנה אפליקציית React מובייל ראשית (RTL, עברית).
מסך בית עם כפתור גדול "צלם שאלה", מסך הסבר עם
שלבים מתקפלים ואנימציות פשוטות, מסך תרגול עם
3 שאלות מותאמות, ומסך התקדמות לפי נושאים.
עיצוב: סקיצה בעברית, צבעי פסטל, אייקונים מצוירים ביד.
שרת: Supabase. AI: GPT-4o-mini עם פרומפט מורה עברי.`}</pre>
    ),
  },
  {
    stepKey: "pitch",
    num: 11,
    phase: "הצגת הפתרון",
    phaseColor: "pill-chip",
    title: "פיץ׳ והצגה",
    what: "הופכים הכול לסיפור משכנע — מתחילים עם דנה, מציגים את הבעיה, את הפתרון, את הוולידציה ואת החזון.",
    learn:
      "אף שופט לא יקרא את ה-PRD שלכם. יש לכם 60-90 שניות. תפתחו עם דמות אחת אמיתית ('תכירו את דנה') — לא עם סטטיסטיקה. שופט שהתחבר לדמות, יזכור את המוצר. סיימו עם בקשה אחת קונקרטית ('תנו לנו פיילוט בבית ספר אחד'). מי שלא יודע מה הוא רוצה, לא מקבל כלום.",
    output: (
      <div className="space-y-3 font-hand text-base">
        <div className="bg-[hsl(var(--coral)/0.25)] sketch-border-thin p-4 ring-2 ring-foreground/30">
          <div className="text-[10px] font-sketch tracking-wider uppercase text-foreground/70 mb-2">
            ⏱️ Elevator pitch — 30 שניות
          </div>
          <p className="leading-relaxed">
            תכירו את <strong>דנה</strong>. היא בת 15, ומתביישת לשאול בשיעור מתמטיקה.
            ההורים שלה לא יכולים להרשות מורה פרטי ב-150 ₪ לשעה.
            דנה לא לבד — <strong>1 מכל 3 תלמידי תיכון בישראל</strong> נכשלים במתמטיקה.
            <br/><br/>
            בנינו את <strong>MathMate</strong>: דנה מצלמת שאלה מהמחברת,
            וה-AI מסביר לה בעברית, בקצב שלה, בלי לשפוט.
            <strong> מורה פרטי בכיס, חינם, 24/7.</strong>
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="sketch-border-thin p-3 bg-background/60">
            <div className="font-sketch text-xs uppercase tracking-wider text-muted-foreground mb-1">הבעיה</div>
            <p>33% מתלמידי התיכון נכשלים במתמטיקה. מורה פרטי עולה 6,000 ₪ לשנה.</p>
          </div>
          <div className="sketch-border-thin p-3 bg-background/60">
            <div className="font-sketch text-xs uppercase tracking-wider text-muted-foreground mb-1">הפרסונה</div>
            <p>דנה, ט׳: חכמה, מתביישת לשאול, אין כסף לעזרה אישית.</p>
          </div>
          <div className="sketch-border-thin p-3 bg-background/60">
            <div className="font-sketch text-xs uppercase tracking-wider text-muted-foreground mb-1">הפתרון</div>
            <p>סורקים שאלה ← הסבר AI בעברית ← 3 תרגילים מותאמים.</p>
          </div>
          <div className="sketch-border-thin p-3 bg-background/60">
            <div className="font-sketch text-xs uppercase tracking-wider text-muted-foreground mb-1">ולידציה</div>
            <p>20 תלמידים נבדקו. 85% הרגישו ביטחון מוגבר תוך שבוע.</p>
          </div>
          <div className="sketch-border-thin p-3 bg-background/60">
            <div className="font-sketch text-xs uppercase tracking-wider text-muted-foreground mb-1">היתרון</div>
            <p>היחיד שמותאם לתוכנית הלימודים הישראלית, בעברית, חינם.</p>
          </div>
          <div className="sketch-border-thin p-3 bg-background/60">
            <div className="font-sketch text-xs uppercase tracking-wider text-muted-foreground mb-1">החזון</div>
            <p>עד 2027 — מורה פרטי AI לכל ילד בישראל. שוויון הזדמנויות אמיתי.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    stepKey: "deliver",
    num: 12,
    phase: "הצגת הפתרון",
    phaseColor: "pill-chip",
    title: "הגשה לגלריה",
    what: "מעלים את המצגת ואת קישור הפיתוח לגלריה המשותפת — כל הקבוצות במקום אחד.",
    learn:
      "הגשה זה לא רק 'סיימנו' — זה הרגע שבו העבודה שלכם הופכת לנכס שאחרים יכולים ללמוד ממנו. תעלו את המצגת, את הקישור לאפליקציה, וגם אם משהו לא מוכן ב-100% — תגישו. גרסה לא מושלמת שאחרים רואים שווה הרבה יותר מגרסה מושלמת שיושבת אצלכם במחשב.",
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

export function getDemoStep(stepKey: string): DemoStep | undefined {
  return DEMO_STEPS.find((s) => s.stepKey === stepKey);
}
