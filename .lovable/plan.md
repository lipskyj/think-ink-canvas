

# שלב חדש: יצירת PRD/פרומפט אוטומטי (שלב 14)

## מה נבנה

שלב סיום חדש שאוסף את כל העבודה שהסטודנט עשה לאורך התהליך ומייצר מסמך PRD (Product Requirements Document) מוכן לשימוש במערכות text-to-code כמו Lovable. הסטודנט יוכל ללחוץ על כפתור "צור PRD" ולקבל מסמך מעוצב ומוכן להעתקה.

## איך זה יעבוד

1. הדף מציג סיכום ויזואלי של כל מה שמולא בשלבים הקודמים (משתמש, בעיה, פתרון, תכונות וכו')
2. כפתור "צור PRD" שולח את כל הנתונים לפונקציית AI שמרכיבה מסמך PRD מובנה
3. התוצאה מוצגת בפורמט מוכן להעתקה עם כפתור "העתק"
4. הסטודנט יכול לערוך/לשפר ולייצר מחדש

## פרטים טכניים

### 1. הוספת שלב חדש ב-`src/lib/steps.ts`
- שלב 14: `prd_generator` בפאזה `development`
- כותרת: "PRD / פרומפט למערכת קוד"
- אייקון: `FileOutput` מ-lucide-react

### 2. יצירת דף חדש `src/pages/PrdGenerator.tsx`
- שימוש ב-`StepPage` כמו כל הדפים האחרים
- סקירה אוטומטית של כל הנתונים מכל השלבים הקודמים (empathy map, persona, POV, HMW, ideation, storyboard, prototype brief וכו')
- כפתור "צור PRD" ששולח הכל ל-AI
- תצוגת תוצאה עם notebook-lines styling
- כפתור "העתק ללוח" להעתקה מהירה
- שדה טקסט לעריכה חופשית של הפרומפט שנוצר

### 3. עדכון `supabase/functions/ai-assist/index.ts`
- הוספת מצב `mode: "prd_generate"` חדש
- ה-system prompt ידריך את ה-AI לייצר PRD מובנה הכולל:
  - סיכום הבעיה (מ-POV, Five Whys)
  - פרופיל המשתמש (מ-Persona, Empathy Map)
  - משימות המשתמש (מ-JTBD)
  - מפת מסע (מ-Journey Map)
  - הפתרון הנבחר (מ-Ideation, Assumptions)
  - תכונות מרכזיות (מ-Prototype Brief)
  - תסריט שימוש (מ-Storyboard)
  - קריטריוני הצלחה (מ-User Testing, Prototype Brief)
- הפלט יהיה בפורמט Markdown מוכן להדבקה

### 4. עדכון `src/App.tsx`
- הוספת Route חדש: `/prd`
- ייבוא הדף החדש

### 5. עדכון `src/pages/Admin.tsx`
- הוספת `prd_generator` ל-fieldLabels עם תוויות בעברית

### קבצים שישתנו
- `src/lib/steps.ts` -- הוספת שלב 14
- `src/pages/PrdGenerator.tsx` -- דף חדש
- `src/App.tsx` -- route חדש
- `supabase/functions/ai-assist/index.ts` -- מצב prd_generate
- `src/pages/Admin.tsx` -- תוויות לשלב החדש
