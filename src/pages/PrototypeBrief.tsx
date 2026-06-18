import { useState, useEffect, useCallback, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";

interface BriefState {
  objective: string;
  must: string;
  should: string;
  could: string;
  wont: string;
  assumptions: string;
  fidelity: string;
  styleVibe: string;
  styleNotes: string;
  successCriteria: string;
  // legacy
  keyFeatures?: string;
}

const STYLE_VIBES = [
  { key: "minimal", label: "מינימליסטי" },
  { key: "playful", label: "שובב / חי" },
  { key: "editorial", label: "אדיטוריאל / מגזין" },
  { key: "tech", label: "טכנולוגי / נקי" },
  { key: "brutalist", label: "ברוטליסטי" },
  { key: "warm", label: "חם / אנושי" },
];

const PrototypeBrief = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [brief, setBrief] = useState<BriefState>({
    objective: "", must: "", should: "", could: "", wont: "",
    assumptions: "", fidelity: "low", styleVibe: "", styleNotes: "", successCriteria: "",
  });

  useEffect(() => {
    const saved = getStepData("prototype_brief");
    if (saved) {
      setBrief((prev) => ({
        ...prev,
        ...saved,
        // migrate legacy keyFeatures into "must"
        must: saved.must || saved.keyFeatures || "",
      }));
    }
  }, [getStepData]);

  const update = (field: keyof BriefState, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  const autoFillFields = useMemo(() => ({
    objective: { value: brief.objective, set: (v: string) => update("objective", v) },
    keyFeatures: { value: brief.must, set: (v: string) => update("must", v) },
    assumptions: { value: brief.assumptions, set: (v: string) => update("assumptions", v) },
  }), [brief.objective, brief.must, brief.assumptions]);
  useAutoFill("prototype_brief", autoFillFields);

  const getData = useCallback(() => brief, [brief]);
  const hasContent = !!(brief.objective.trim() || brief.must.trim());
  const previousData = getAllPreviousData("prototype_brief");

  return (
    <StepPage stepKey="prototype_brief" onSave={getData} canComplete={hasContent}>
      <CoherenceTracker stepKey="prototype_brief" currentData={brief} />

      <div className="sketch-border p-5 mb-6 bg-secondary/30">
        <p className="font-hand text-lg">
          הבריף הוא חוזה קצר עם עצמכם — מה ייבנה, באיזה סדר עדיפויות, ואיך זה יראה ויורגש.
        </p>
      </div>

      <div className="space-y-5">
        {/* Objective */}
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-xl block mb-1">מטרה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="objective" currentData={brief} previousData={previousData} onApply={(v) => update("objective", v)} />
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-3">מה אתם מנסים ללמוד, לאמת או להוכיח?</p>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="לדוגמה: לוודא שמשתמשים מבינים את הצעת הערך תוך 10 שניות..." value={brief.objective} onChange={(e) => update("objective", e.target.value)} />
        </div>

        {/* MoSCoW */}
        <div className="sketch-card">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label className="font-sketch text-xl">MoSCoW — תיעדוף תכונות</label>
            <span className="pill-chip pill-chip-outline text-[10px]">Must · Should · Could · Won't</span>
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-4">
            מיינו את התכונות לארבע קטגוריות. זה מה שמבדיל MVP ממוצר נפוח.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="sketch-border-thin p-3 bg-[hsl(var(--primary)/0.08)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Must — חובה</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="must" currentData={brief} previousData={previousData} onApply={(v) => update("must", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">בלי זה אין מוצר. ליבת ה-MVP.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="התכונות הקריטיות..." value={brief.must} onChange={(e) => update("must", e.target.value)} />
            </div>

            <div className="sketch-border-thin p-3 bg-[hsl(var(--accent)/0.15)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Should — חשוב</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="should" currentData={brief} previousData={previousData} onApply={(v) => update("should", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">חשוב מאוד, אך לא מעכב השקה.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="תכונות שתשתדלו להכניס..." value={brief.should} onChange={(e) => update("should", e.target.value)} />
            </div>

            <div className="sketch-border-thin p-3 bg-[hsl(var(--highlight)/0.12)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Could — אם יש זמן</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="could" currentData={brief} previousData={previousData} onApply={(v) => update("could", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">Nice-to-have. רק אם נשאר זמן.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="תכונות בונוס..." value={brief.could} onChange={(e) => update("could", e.target.value)} />
            </div>

            <div className="sketch-border-thin p-3 bg-foreground/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Won't — לא הפעם</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="wont" currentData={brief} previousData={previousData} onApply={(v) => update("wont", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">מחוץ להיקף. שומרים לגרסה הבאה.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="מה במפורש לא בונים עכשיו..." value={brief.wont} onChange={(e) => update("wont", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Style / vibe */}
        <div className="sketch-card">
          <label className="font-sketch text-xl block mb-1">סגנון והעדפות עיצוב</label>
          <p className="font-hand text-muted-foreground text-sm mb-3">בחרו vibe מוביל — והוסיפו פירוט.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {STYLE_VIBES.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => update("styleVibe", brief.styleVibe === v.key ? "" : v.key)}
                className={`px-3 py-1.5 rounded-full font-sketch text-sm border-2 transition-all ${
                  brief.styleVibe === v.key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-foreground/30 hover:border-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <textarea
            className="sketch-input min-h-[80px] resize-none notebook-lines"
            placeholder="הערות סגנון: פלטה, טיפוגרפיה, השראות (מותגים/אתרים), אווירה..."
            value={brief.styleNotes}
            onChange={(e) => update("styleNotes", e.target.value)}
          />
        </div>

        {/* Fidelity */}
        <div className="sketch-card">
          <label className="font-sketch text-xl block mb-3">רמת נאמנות</label>
          <div className="flex gap-2">
            {[{ key: "low", label: "נמוכה" }, { key: "medium", label: "בינונית" }, { key: "high", label: "גבוהה" }].map((level) => (
              <button key={level.key} onClick={() => update("fidelity", level.key)} className={`flex-1 py-2.5 text-base font-sketch ${brief.fidelity === level.key ? "sketch-border bg-foreground text-background" : "sketch-border-thin"}`}>
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assumptions */}
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-xl block mb-2">הנחות לבדיקה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="assumptions" currentData={brief} previousData={previousData} onApply={(v) => update("assumptions", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="אילו הנחות אנחנו בודקים?" value={brief.assumptions} onChange={(e) => update("assumptions", e.target.value)} />
        </div>

        {/* Success */}
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-xl block mb-2">קריטריוני הצלחה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="successCriteria" currentData={brief} previousData={previousData} onApply={(v) => update("successCriteria", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="איך תדעו אם אב-הטיפוס הצליח?" value={brief.successCriteria} onChange={(e) => update("successCriteria", e.target.value)} />
        </div>
      </div>
    </StepPage>
  );
};

export default PrototypeBrief;
