import { useState, useEffect, useCallback, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import Phase2Recap from "@/components/Phase2Recap";
import { useAutoFill } from "@/hooks/useAutoFill";
import { BRIEF_QUESTIONS } from "@/lib/briefQuestions";

interface BriefState {
  objective: string;
  must: string;
  should: string;
  could: string;
  wont: string;
  assumptions: string;
  styleVibe: string;
  styleNotes: string;
  successCriteria: string;
  briefingAnswers: Record<string, string>;
  // legacy
  keyFeatures?: string;
  fidelity?: string;
}

const STYLE_VIBES = [
  { key: "cyber", label: "סייבר / ניאון", swatch: ["#0a0a0a", "#00ff66", "#ff0055", "#7b81ff"], font: "'Heebo', sans-serif" },
  { key: "light", label: "בהיר ורגוע", swatch: ["#f5f7fb", "#a0caff", "#bdd0fe", "#ffd0e8"], font: "'Heebo', sans-serif" },
  { key: "futuristic", label: "פוטוריסטי", swatch: ["#0a0a14", "#6c5cff", "#00e5ff", "#ff4dd2"], font: "'Heebo', sans-serif" },
  { key: "playful", label: "שובב / סטיקרים", swatch: ["#f7e8d0", "#ff6b6b", "#ffd166", "#06d6a0"], font: "'Heebo', sans-serif" },
  { key: "editorial", label: "אדיטוריאל / בולד", swatch: ["#ffffff", "#111111", "#333333", "#f5f5f5"], font: "'Heebo', serif" },
  { key: "soft_glass", label: "זכוכית רכה", swatch: ["#e9e6ff", "#c8c0ff", "#ffd0e8", "#a8c8ff"], font: "'Heebo', sans-serif" },
  { key: "organic", label: "אורגני / טבע", swatch: ["#f0ebe0", "#7f8f56", "#c9a87a", "#3a4a2a"], font: "'Heebo', serif" },
  { key: "fun_bright", label: "כיף ובהיר", swatch: ["#2e6cff", "#ffd400", "#ff5e8a", "#00c9b1"], font: "'Heebo', sans-serif" },
  { key: "warm_elegant", label: "חם ואלגנטי", swatch: ["#f4ede2", "#caa478", "#8b6f47", "#3d2e1f"], font: "'Heebo', serif" },
];

const PrototypeBrief = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [brief, setBrief] = useState<BriefState>({
    objective: "", must: "", should: "", could: "", wont: "",
    assumptions: "", styleVibe: "", styleNotes: "", successCriteria: "",
    briefingAnswers: {},
  });

  useEffect(() => {
    const saved = getStepData("prototype_brief");
    if (saved) {
      setBrief((prev) => ({
        ...prev,
        ...saved,
        must: saved.must || saved.keyFeatures || "",
        briefingAnswers: saved.briefingAnswers || {},
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

  const getData = useCallback(() => ({ ...brief }), [brief]);
  const hasContent = !!(brief.objective.trim() || brief.must.trim());
  const previousData = getAllPreviousData("prototype_brief");


  return (
    <StepPage stepKey="prototype_brief" onSave={getData} canComplete={hasContent} phaseRecapKey="phase2_recap_dismissed">
      <Phase2Recap />
      <CoherenceTracker stepKey="prototype_brief" currentData={brief} />


      <div className="sketch-border p-5 mb-6 bg-secondary/30">
        <p className="font-hand text-lg">
          הבריף הוא חוזה קצר עם עצמכם — מה ייבנה, באיזה סדר עדיפויות, ואיך זה יראה ויורגש.
        </p>
      </div>

      {/* Guided briefing questions with template chips */}
      <div className="sketch-card mb-6">
        <label className="font-sketch text-xl block mb-1">7 שאלות לפני שמתחילים לבנות</label>
        <p className="font-hand text-muted-foreground text-sm mb-4">
          ענו על מה שרלוונטי. לחיצה על תבנית מוסיפה אותה לתשובה — אפשר לערוך אחרי.
        </p>
        <div className="space-y-5">
          {BRIEF_QUESTIONS.map((q) => {
            const value = brief.briefingAnswers[q.key] || "";
            const setValue = (next: string) =>
              setBrief((prev) => ({
                ...prev,
                briefingAnswers: { ...prev.briefingAnswers, [q.key]: next },
              }));
            return (
              <div key={q.key} className="sketch-border-thin p-3 bg-background rounded">
                <div className="font-sketch text-base mb-1">{q.title}</div>
                <div className="font-hand text-xs text-muted-foreground mb-2">{q.hint}</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {q.templates.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue(value ? `${value}\n• ${t}` : `• ${t}`)}
                      className="pill-chip pill-chip-outline text-xs cursor-pointer"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
                <textarea
                  className="sketch-input min-h-[70px] resize-none notebook-lines text-sm"
                  placeholder="כתבו את התשובה שלכם, או לחצו על תבנית למעלה..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            );
          })}
        </div>
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

        {/* Style / vibe with visual swatches */}
        <div className="sketch-card">
          <label className="font-sketch text-xl block mb-1">סגנון והעדפות עיצוב</label>
          <p className="font-hand text-muted-foreground text-sm mb-3">בחרו טעם ויזואלי — והוסיפו פירוט.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {STYLE_VIBES.map((v) => {
              const active = brief.styleVibe === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => update("styleVibe", active ? "" : v.key)}
                  className={`text-right border-2 rounded-md p-3 transition-all ${
                    active ? "border-foreground bg-secondary/40" : "border-foreground/20 hover:border-foreground/60"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-2">
                    {v.swatch.map((c, idx) => (
                      <div key={idx} className="w-6 h-6 rounded-sm border border-foreground/20" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="font-sketch text-base" style={{ fontFamily: v.font }}>{v.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: v.font }}>
                    Aa — שלום עולם
                  </div>
                </button>
              );
            })}
          </div>
          <textarea
            className="sketch-input min-h-[80px] resize-none notebook-lines"
            placeholder="הערות סגנון: פלטה, טיפוגרפיה, השראות (מותגים/אתרים), אווירה..."
            value={brief.styleNotes}
            onChange={(e) => update("styleNotes", e.target.value)}
          />
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
