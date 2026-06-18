import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Plus, X, AlertTriangle } from "lucide-react";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";
import { getLinkedData } from "@/lib/dataLinks";

interface Assumption {
  id: string;
  text: string;
  isRiskiest: boolean;
  isTestable: boolean;
  testMethod: string;
}

const EMPTY_ASSUMPTION = (): Assumption => ({
  id: crypto.randomUUID(), text: "", isRiskiest: false, isTestable: false, testMethod: "",
});

const AssumptionSelection = () => {
  const { getStepData, saveStepData, getAllPreviousData, stepData } = useProject();
  const existing = getStepData("assumption_selection") as { assumptions?: Assumption[]; successConditions?: string } | null;

  const [assumptions, setAssumptions] = useState<Assumption[]>(existing?.assumptions?.length ? existing.assumptions : [EMPTY_ASSUMPTION()]);
  const [successConditions, setSuccessConditions] = useState(existing?.successConditions || "");
  const [didAutoFillAssumptions, setDidAutoFillAssumptions] = useState(false);

  useEffect(() => {
    const data = getStepData("assumption_selection") as { assumptions?: Assumption[]; successConditions?: string } | null;
    if (data?.assumptions?.length) {
      setAssumptions(data.assumptions);
      setSuccessConditions(data.successConditions || "");
    }
  }, [getStepData]);

  // Auto-fill assumptions from Converge insights
  useEffect(() => {
    if (didAutoFillAssumptions) return;
    const saved = getStepData("assumption_selection") as { assumptions?: Assumption[] } | null;
    if (saved?.assumptions?.some((a) => a.text.trim())) return;

    const links = getLinkedData("assumption_selection", stepData);
    const insightsLink = links.find(l => l.field === "assumptions_text");
    if (insightsLink) {
      const texts = insightsLink.value.split("\n").filter(t => t.trim());
      if (texts.length > 0) {
        setAssumptions(texts.map(t => ({ ...EMPTY_ASSUMPTION(), text: t })));
        setDidAutoFillAssumptions(true);
      }
    }
  }, [stepData, didAutoFillAssumptions, getStepData]);

  const save = (a: Assumption[], sc: string) => {
    saveStepData("assumption_selection", { assumptions: a, successConditions: sc });
  };
  const updateAssumption = (id: string, updates: Partial<Assumption>) => {
    const updated = assumptions.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAssumptions(updated);
    save(updated, successConditions);
  };
  const addAssumption = () => {
    const updated = [...assumptions, EMPTY_ASSUMPTION()];
    setAssumptions(updated);
    save(updated, successConditions);
  };
  const removeAssumption = (id: string) => {
    const updated = assumptions.filter((a) => a.id !== id);
    setAssumptions(updated);
    save(updated, successConditions);
  };

  const riskiestCount = assumptions.filter((a) => a.isRiskiest).length;
  const testableCount = assumptions.filter((a) => a.isTestable).length;
  const filledCount = assumptions.filter((a) => a.text.trim()).length;
  const previousData = getAllPreviousData("assumption_selection");

  return (
    <StepPage stepKey="assumption_selection">
      <CoherenceTracker stepKey="assumption_selection" currentData={{ assumptions, successConditions }} />

      <div className="space-y-8">
        <div className="sketch-border-thin p-4 bg-secondary/20">
          <h3 className="font-sketch text-lg mb-3 flex items-center gap-2">
            <ShieldCheck size={20} /> רשימת בדיקת הנחות
          </h3>
          <div className="space-y-2 font-hand text-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={filledCount >= 1} readOnly className="h-5 w-5 accent-foreground" />
              <span className={filledCount >= 1 ? "line-through text-muted-foreground" : ""}>זיהיתי מה חייב להיות נכון להצלחה</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={riskiestCount >= 1 && riskiestCount <= 2} readOnly className="h-5 w-5 accent-foreground" />
              <span className={riskiestCount >= 1 && riskiestCount <= 2 ? "line-through text-muted-foreground" : ""}>בחרתי 1–2 הנחות מסוכנות ביותר</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={testableCount >= 1} readOnly className="h-5 w-5 accent-foreground" />
              <span className={testableCount >= 1 ? "line-through text-muted-foreground" : ""}>אלה ניתנות לבדיקה</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center relative">
            <label className="font-sketch text-sm block mb-2">מה חייב להיות נכון כדי שהפתרון יצליח?</label>
            <SectionHelper stepKey="assumption_selection" sectionKey="successConditions" currentData={{ assumptions, successConditions }} previousData={previousData} onApply={(v) => { setSuccessConditions(v); save(assumptions, v); }} />
          </div>
          <textarea className="sketch-input notebook-lines min-h-[80px]" placeholder="לדוגמה: משתמשים חייבים לסמוך על הפלטפורמה מספיק כדי לשתף מידע אישי..." value={successConditions} onChange={(e) => { setSuccessConditions(e.target.value); save(assumptions, e.target.value); }} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center relative">
            <h3 className="font-sketch text-lg">ההנחות שלכם</h3>
            <SectionHelper stepKey="assumption_selection" sectionKey="assumption" currentData={{ assumptions, successConditions }} previousData={previousData} onApply={(v) => updateAssumption(assumptions[0]?.id, { text: v })} />
          </div>

          {assumptions.map((assumption, idx) => (
            <div key={assumption.id} className="sketch-border-thin p-4 space-y-3 relative">
              {assumptions.length > 1 && (
                <button onClick={() => removeAssumption(assumption.id)} className="absolute top-2 left-2 text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              )}
              <div className="flex items-start gap-2">
                <span className="stage-number text-sm w-8 h-8 shrink-0">{idx + 1}</span>
                <textarea className="sketch-input notebook-lines min-h-[60px] flex-1" placeholder="תארו את ההנחה..." value={assumption.text} onChange={(e) => updateAssumption(assumption.id, { text: e.target.value })} />
              </div>
              <div className="flex flex-wrap gap-4 pr-10">
                <label className="flex items-center gap-2 cursor-pointer font-hand text-lg">
                  <input type="checkbox" checked={assumption.isRiskiest} onChange={(e) => updateAssumption(assumption.id, { isRiskiest: e.target.checked })} className="h-4 w-4 accent-foreground" />
                  <span className="flex items-center gap-1"><AlertTriangle size={14} /> מסוכנת ביותר</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-hand text-lg">
                  <input type="checkbox" checked={assumption.isTestable} onChange={(e) => updateAssumption(assumption.id, { isTestable: e.target.checked })} className="h-4 w-4 accent-foreground" />
                  ניתנת לבדיקה
                </label>
              </div>
              {assumption.isTestable && (
                <div className="pr-10">
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">איך תבדקו אותה?</label>
                    <SectionHelper stepKey="assumption_selection" sectionKey="testMethod" currentData={{ assumption }} previousData={previousData} />
                  </div>
                  <input type="text" className="sketch-input" placeholder="לדוגמה: ראיון 5 משתמשים, הרצת מבחן דף נחיתה..." value={assumption.testMethod} onChange={(e) => updateAssumption(assumption.id, { testMethod: e.target.value })} />
                </div>
              )}
            </div>
          ))}

          <button onClick={addAssumption} className="sketch-btn-outline flex items-center gap-2 text-sm">
            <Plus size={16} /> הוסף הנחה
          </button>
        </div>
      </div>
    </StepPage>
  );
};

export default AssumptionSelection;
