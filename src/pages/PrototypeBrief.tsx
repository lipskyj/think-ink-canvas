import { useState, useEffect, useCallback, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";

const PrototypeBrief = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [brief, setBrief] = useState({
    objective: "", keyFeatures: "", assumptions: "", fidelity: "low", successCriteria: "",
  });


  useEffect(() => {
    const saved = getStepData("prototype_brief");
    if (saved) setBrief((prev) => ({ ...prev, ...saved }));
  }, [getStepData]);

  const update = (field: string, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-fill from POV, Ideation, AssumptionSelection
  const autoFillFields = useMemo(() => ({
    objective: { value: brief.objective, set: (v: string) => update("objective", v) },
    keyFeatures: { value: brief.keyFeatures, set: (v: string) => update("keyFeatures", v) },
    assumptions: { value: brief.assumptions, set: (v: string) => update("assumptions", v) },
  }), [brief.objective, brief.keyFeatures, brief.assumptions]);
  useAutoFill("prototype_brief", autoFillFields);

  const getData = useCallback(() => brief, [brief]);
  const hasContent = brief.objective.trim() || brief.scope.trim();
  const previousData = getAllPreviousData("prototype_brief");

  return (
    <StepPage stepKey="prototype_brief" onSave={getData} canComplete={!!hasContent}>
      <CoherenceTracker stepKey="prototype_brief" currentData={brief} />

      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <p className="font-hand text-lg text-muted-foreground">
          📄 הגדירו מה תיצרו כאב-טיפוס — היקף, תכונות, ומה תרצו ללמוד.
        </p>
      </div>

      <div className="space-y-4">
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-lg block mb-2">🎯 מטרה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="objective" currentData={brief} previousData={previousData} onApply={(v) => update("objective", v)} />
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-2">מה אתם מנסים ללמוד או לאמת?</p>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="לדוגמה: לוודא שמשתמשים יכולים להשלים את ה-onboarding תוך פחות מ-2 דקות..." value={brief.objective} onChange={(e) => update("objective", e.target.value)} />
        </div>

        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-lg block mb-2">📐 היקף</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="scope" currentData={brief} previousData={previousData} onApply={(v) => update("scope", v)} />
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-2">מה בתוך ומחוץ להיקף?</p>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="בהיקף: תהליך הצטרפות, חיפוש. מחוץ להיקף: הגדרות, התראות..." value={brief.scope} onChange={(e) => update("scope", e.target.value)} />
        </div>

        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-lg block mb-2">⭐ תכונות מרכזיות</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="features" currentData={brief} previousData={previousData} onApply={(v) => update("keyFeatures", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="רשמו את התכונות המרכזיות שיש לכלול באב-הטיפוס..." value={brief.keyFeatures} onChange={(e) => update("keyFeatures", e.target.value)} />
        </div>

        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-lg block mb-2">🔬 הנחות לבדיקה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="assumptions" currentData={brief} previousData={previousData} onApply={(v) => update("assumptions", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="אילו הנחות אנחנו בודקים?" value={brief.assumptions} onChange={(e) => update("assumptions", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="sketch-card">
            <div className="flex items-center relative">
              <label className="font-sketch text-lg block mb-2">🎨 רמת נאמנות</label>
              <SectionHelper stepKey="prototype_brief" sectionKey="fidelity" currentData={brief} previousData={previousData} />
            </div>
            <div className="flex gap-2">
              {[{ key: "low", label: "נמוכה" }, { key: "medium", label: "בינונית" }, { key: "high", label: "גבוהה" }].map((level) => (
                <button key={level.key} onClick={() => update("fidelity", level.key)} className={`flex-1 py-2 text-sm font-sketch ${brief.fidelity === level.key ? "sketch-border bg-foreground text-primary-foreground" : "sketch-border-thin"}`}>
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sketch-card">
            <div className="flex items-center relative">
              <label className="font-sketch text-lg block mb-2">⏰ לוח זמנים</label>
              <SectionHelper stepKey="prototype_brief" sectionKey="timeline" currentData={brief} previousData={previousData} />
            </div>
            <input className="sketch-input" placeholder="לדוגמה: ספרינט של שבוע..." value={brief.timeline} onChange={(e) => update("timeline", e.target.value)} />
          </div>
        </div>

        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-lg block mb-2">✅ קריטריוני הצלחה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="successCriteria" currentData={brief} previousData={previousData} onApply={(v) => update("successCriteria", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="איך תדעו אם אב-הטיפוס הצליח?" value={brief.successCriteria} onChange={(e) => update("successCriteria", e.target.value)} />
        </div>
      </div>
    </StepPage>
  );
};

export default PrototypeBrief;
