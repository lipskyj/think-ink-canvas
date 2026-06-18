
## מה בונים

פאנל **Learn → See → Do** אחד לכל פאזה (4 סה"כ), מוצג בראש העמוד של **השלב הראשון של כל פאזה**. התוכן נוצר דינמית על ידי AI בטון "מדריך" ישראלי, ומותאם לנושא של הצוות (כללי בהתחלה, מתחדד תוך כדי).

ה-tips הקיימים (כפתור i) נשארים בלי שינוי — הם מקור להעמקה לשלב הספציפי. ה-LSD הוא הכניסה לפאזה.

## איפה זה מופיע

4 שלבי-פתיחה של פאזות (לפי `src/lib/steps.ts` → `phase`):
- **Empathize** → בראש Empathy Map (שלב ראשון ב-`problem`)
- **Define** → בראש POV / Define
- **Ideate** → בראש HMW / Ideation
- **Prototype** → בראש Prototype Brief

ברירת מחדל: פתוח. אחרי קריאה ראשונה, נסגר ונשאר לחצן "🚀 פתח שוב" קטן ליד כותרת השלב. (state נשמר ב-localStorage per-phase per-team.)

## תוכן וטון

הפאנל מציג שלוש כרטיסיות עם תגיות `[LEARN]` `[SEE]` `[DO]` בעברית:
- **🚀 דקה של מיינדסט** — היפוך תפיסה קצר עם וו תרבותי (הפסקה, מזנון, בגרויות, ביט, בוטים בוואטסאפ).
- **👀 דוגמה מהשטח** — סיפור קצר של תלמיד פיקטיבי שפותר בעיה בית-ספרית בעזרת הכלי של הפאזה.
- **🛠️ התור שלכם בזירה** — מטרה במשפט, 2-3 הוראות, ונוסחה למילוי שמדברת בדיוק על השדות בעמוד הנוכחי.

טון: מדריך נוער חד, אנרגטי, חברי. בלי "תלמידים יקרים", בלי וידאו, בלי תאוריה ב-DO.

## התאמה לנושא (Theme)

נושא מוזן בשני שלבים:
1. **כללי** — מוזן בעמוד הבית / הצטרפות לכיתה ("נושא ההאקתון: למשל 'נוער ובריאות נפש'"). שדה אחד, חופשי, אופציונלי. נשמר ב-`team_session.theme`.
2. **ספציפי לצוות** — מהשלב שבו יש POV או Empathy Insight, ה-AI מקבל גם snapshot של הנתונים הקיימים (user, need, insight, HMW) ומדייק את ה-SEE/DO סביבו.

ב-`useLearnSeeDo(phase)` נחבר את שני המקורות לקריאה אחת.

## ארכיטקטורה טכנית

**Edge function חדש:** `supabase/functions/learn-see-do/index.ts`
- Input: `{ phase: 'empathize'|'define'|'ideate'|'prototype', theme?: string, context?: { user?, need?, insight?, hmw? } }`
- System prompt: גרסה מקוצרת בעברית של ה-spec של המשתמש + JSON output schema קשיח (`learn`, `see: {context, execution}`, `do: {objective, steps[], formula}`)
- Model: `google/gemini-3-flash-preview` דרך Lovable AI Gateway
- מחזיר JSON; ה-client מציג structured.

**Cache:** תוצאה נשמרת ב-`team_session.lsd_cache[phase]` (כבר יש לנו team_session ב-Supabase). מתרענן אוטומטית אם ה-theme/context משתנה משמעותית, או ידנית בכפתור "🎲 ערבב מחדש".

**רכיב חדש:** `src/components/LearnSeeDoPanel.tsx` — שלוש כרטיסיות בסגנון ה-zine הקיים (Arial, מסגרות מקווקוות, monochrome). כפתור skeleton בזמן טעינה.

**Hook:** `src/hooks/useLearnSeeDo.ts` — מטפל ב-fetch, cache, ובכפיית exclusivity (סוגר פאנלים אחרים כשנפתח, לפי כלל ה-Single panel global).

**אינטגרציה:** מוסיפים `<LearnSeeDoPanel phase="empathize" />` בראש 4 העמודים, מעל ה-StepOnboarding הקיים.

## טקסטים והגנות
- אם ה-AI נכשל (429/402/timeout) — נופלים ל-**fallback סטטי** שכתוב ידנית לכל פאזה (גם זה משאיר את ה-UX שלם). הטקסטים הסטטיים נשמרים ב-`src/content/lsd-fallback.ts`.
- שגיאות מוצגות בעדינות + כפתור "נסה שוב".

## פירוט קבצים

```text
חדש:
  supabase/functions/learn-see-do/index.ts
  src/components/LearnSeeDoPanel.tsx
  src/hooks/useLearnSeeDo.ts
  src/content/lsd-fallback.ts
  src/lib/teamTheme.ts          (קריאה/שמירה של ה-theme)

עריכה:
  src/pages/EmpathyMap.tsx      (הוספת פאנל בראש)
  src/pages/POV.tsx
  src/pages/HowMightWe.tsx
  src/pages/PrototypeBrief.tsx
  src/pages/Home.tsx            (שדה theme בהצטרפות לכיתה)
  src/lib/hackathon.ts          (טיפוס + persistence ל-theme + lsd_cache)
```

## הערכת היקף
בינוני. ~2-3 שעות עבודה. הסיכון העיקרי: הטון של ה-AI — אצטרך לכייל system prompt בעברית עם 2-3 דוגמאות few-shot כדי שלא יצא תרגום מילולי מאנגלית. כל השאר ישר קדימה.
