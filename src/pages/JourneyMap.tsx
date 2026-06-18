import { useState, useEffect, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import { useAutoFill } from "@/hooks/useAutoFill";

interface JourneyStage {
  stage: string;
  action: string;
  thinking: string;
  feeling: string;
  painPoints: string;
  opportunities: string;
}

const defaultStages: JourneyStage[] = [
  { stage: "מודעות", action: "", thinking: "", feeling: "", painPoints: "", opportunities: "" },
  { stage: "שיקול", action: "", thinking: "", feeling: "", painPoints: "", opportunities: "" },
  { stage: "החלטה", action: "", thinking: "", feeling: "", painPoints: "", opportunities: "" },
  { stage: "שימוש", action: "", thinking: "", feeling: "", painPoints: "", opportunities: "" },
  { stage: "לאחר שימוש", action: "", thinking: "", feeling: "", painPoints: "", opportunities: "" },
];

const ACTION_GHOSTS = [
  "מחפש מידע ברשת, שואל חברים...",
  "משווה בין אפשרויות, קורא ביקורות...",
  "נרשם לשירות, מבצע רכישה...",
  "מנסה את המוצר בפעם הראשונה...",
  "חוזר להשתמש, ממליץ לאחרים...",
];

const THINKING_GHOSTS = [
  "״האם יש פתרון לבעיה שלי?״",
  "״מה ההבדל בין האפשרויות?״",
  "״האם זה שווה את ההשקעה?״",
  "״איך זה עובד? זה מה שציפיתי?״",
  "״האם אמשיך להשתמש בזה?״",
];

const FEELING_GHOSTS = [
  "סקרנות, קצת חוסר ודאות...",
  "חרדה מבחירה לא נכונה...",
  "התרגשות, ציפייה...",
  "הפתעה, שביעות רצון או אכזבה...",
  "נאמנות, או תסכול מצטבר...",
];

const PAIN_GHOSTS = [
  "קשה למצוא מידע אמין...",
  "יותר מדי אפשרויות, בלבול...",
  "תהליך ההרשמה ארוך ומסורבל...",
  "ממשק לא אינטואיטיבי, צריך עזרה...",
  "אין מענה כשמשהו לא עובד...",
];

const OPP_GHOSTS = [
  "תוכן ברור שעונה על שאלות נפוצות...",
  "כלי השוואה פשוט וויזואלי...",
  "הרשמה בלחיצה אחת...",
  "הדרכה מובנית בתוך המוצר...",
  "מערכת משוב ותמיכה פרואקטיבית...",
];

const JourneyMap = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const saved = getStepData("journey_map");

  const [scenario, setScenario] = useState(saved?.scenario || "");
  const [stages, setStages] = useState<JourneyStage[]>(saved?.stages || defaultStages);

  useEffect(() => {
    if (saved) {
      setScenario(saved.scenario || "");
      setStages(saved.stages || defaultStages);
    }
  }, [saved]);

  // Auto-fill scenario from persona
  const autoFillFields = useMemo(() => ({
    scenario: { value: scenario, set: setScenario },
  }), [scenario]);
  useAutoFill("journey_map", autoFillFields);

  const updateStage = (index: number, field: keyof JourneyStage, value: string) => {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };
  const addStage = () => {
    setStages((prev) => [...prev, { stage: "", action: "", thinking: "", feeling: "", painPoints: "", opportunities: "" }]);
  };
  const removeStage = (index: number) => {
    if (stages.length <= 2) return;
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  const getData = () => ({ scenario, stages });
  const previousData = getAllPreviousData("journey_map");

  return (
    <StepPage stepKey="journey_map" onSave={getData}>
      <div className="sketch-card mb-6">
        <div className="flex items-center relative">
          <label className="font-sketch text-sm block mb-2">תרחיש / הקשר</label>
          <SectionHelper stepKey="journey_map" sectionKey="scenario" currentData={getData()} previousData={previousData} onApply={(v) => setScenario(v)} />
        </div>
        <textarea className="sketch-input min-h-[60px]" placeholder="שרה, מורה לביולוגיה, מנסה למצוא פעילות מעבדה מתאימה לשיעור של מחר..." value={scenario} onChange={(e) => setScenario(e.target.value)} />
      </div>

      <div className="space-y-6">
        {stages.map((stage, i) => (
          <div key={i} className="sketch-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 relative">
                <span className="stage-number">{i + 1}</span>
                <input className="sketch-input font-sketch max-w-[200px]" placeholder="שם שלב" value={stage.stage} onChange={(e) => updateStage(i, "stage", e.target.value)} />
                <SectionHelper stepKey="journey_map" sectionKey="stage" currentData={{ scenario, stage }} previousData={previousData} onApply={(v) => updateStage(i, "action", v)} />
              </div>
              {stages.length > 2 && (
                <button onClick={() => removeStage(i)} className="font-hand text-muted-foreground hover:text-foreground text-lg"></button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs block mb-1"> פעולה</label>
                  <SectionHelper stepKey="journey_map" sectionKey="action" currentData={{ scenario, stage }} previousData={previousData} onApply={(v) => updateStage(i, "action", v)} />
                </div>
                <textarea className="sketch-input min-h-[50px] text-sm" placeholder={ACTION_GHOSTS[i % ACTION_GHOSTS.length]} value={stage.action} onChange={(e) => updateStage(i, "action", e.target.value)} />
              </div>
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs block mb-1"> חשיבה</label>
                  <SectionHelper stepKey="journey_map" sectionKey="thinking" currentData={{ scenario, stage }} previousData={previousData} onApply={(v) => updateStage(i, "thinking", v)} />
                </div>
                <textarea className="sketch-input min-h-[50px] text-sm" placeholder={THINKING_GHOSTS[i % THINKING_GHOSTS.length]} value={stage.thinking} onChange={(e) => updateStage(i, "thinking", e.target.value)} />
              </div>
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs block mb-1">️ רגש</label>
                  <SectionHelper stepKey="journey_map" sectionKey="feeling" currentData={{ scenario, stage }} previousData={previousData} />
                </div>
                <textarea className="sketch-input min-h-[50px] text-sm" placeholder={FEELING_GHOSTS[i % FEELING_GHOSTS.length]} value={stage.feeling} onChange={(e) => updateStage(i, "feeling", e.target.value)} />
              </div>
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs block mb-1"> נקודות כאב</label>
                  <SectionHelper stepKey="journey_map" sectionKey="painPoints" currentData={{ scenario, stage }} previousData={previousData} />
                </div>
                <textarea className="sketch-input min-h-[50px] text-sm" placeholder={PAIN_GHOSTS[i % PAIN_GHOSTS.length]} value={stage.painPoints} onChange={(e) => updateStage(i, "painPoints", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs block mb-1"> הזדמנויות</label>
                  <SectionHelper stepKey="journey_map" sectionKey="opportunities" currentData={{ scenario, stage }} previousData={previousData} />
                </div>
                <textarea className="sketch-input min-h-[50px] text-sm" placeholder={OPP_GHOSTS[i % OPP_GHOSTS.length]} value={stage.opportunities} onChange={(e) => updateStage(i, "opportunities", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addStage} className="sketch-btn-outline mt-4 text-sm">+ הוסף שלב</button>
    </StepPage>
  );
};

export default JourneyMap;