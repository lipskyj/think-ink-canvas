import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import LinkedDataBanner from "@/components/LinkedDataBanner";
import SectionHelper from "@/components/SectionHelper";
import { useAutoFill } from "@/hooks/useAutoFill";
import { getLinkedData } from "@/lib/dataLinks";

const HowMightWe = () => {
  const { getStepData, getAllPreviousData, stepData } = useProject();
  const [questions, setQuestions] = useState<string[]>([""]);
  const [didAutoFillList, setDidAutoFillList] = useState(false);

  // POV fields
  const [povUser, setPovUser] = useState("");
  const [povNeed, setPovNeed] = useState("");
  const [povInsight, setPovInsight] = useState("");

  useEffect(() => {
    const saved = getStepData("how_might_we");
    if (saved?.questions) setQuestions(saved.questions);
    if (saved?.povUser) setPovUser(saved.povUser);
    if (saved?.povNeed) setPovNeed(saved.povNeed);
    if (saved?.povInsight) setPovInsight(saved.povInsight);
  }, [getStepData]);

  // Auto-fill POV from pov_statement step
  useEffect(() => {
    const saved = getStepData("how_might_we");
    if (saved?.povUser || saved?.povNeed || saved?.povInsight) return;

    const povData = getStepData("pov_statement");
    if (povData) {
      if (povData.user && !povUser) setPovUser(povData.user);
      if (povData.need && !povNeed) setPovNeed(povData.need);
      if (povData.insight && !povInsight) setPovInsight(povData.insight);
    }
  }, [stepData, getStepData]);

  // Auto-fill questions list from Converge HMWs
  useEffect(() => {
    if (didAutoFillList) return;
    const saved = getStepData("how_might_we");
    if (saved?.questions?.some((q: string) => q.trim())) return;

    const links = getLinkedData("how_might_we", stepData);
    const questionsLink = links.find(l => l.field === "questions");
    if (questionsLink) {
      try {
        const parsed = JSON.parse(questionsLink.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setDidAutoFillList(true);
        }
      } catch { /* not JSON, ignore */ }
    }
  }, [stepData, didAutoFillList, getStepData]);

  const addQuestion = () => {
    if (questions.length >= 3) return;
    setQuestions([...questions, ""]);
  };
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, val: string) => {
    const updated = [...questions];
    updated[i] = val;
    setQuestions(updated);
  };

  const inspireQuestions = () => {
    const u = povUser.trim() || "המשתמש";
    const n = povNeed.trim() || "להתמודד עם הקושי שלו";
    const i = povInsight.trim() || "התובנה שגילינו";
    const starters = [
      `איך נוכל לעזור ל${u} ${n}?`,
      `איך נוכל להפוך את "${i}" מבעיה ליתרון?`,
      `איך נוכל לחסוך ל${u} את הצורך ב${n}?`,
    ];
    setQuestions(starters);
  };

  const getData = useCallback(() => ({ questions, povUser, povNeed, povInsight }), [questions, povUser, povNeed, povInsight]);
  const hasContent = questions.some(q => q.trim()) || !!(povUser.trim() || povNeed.trim() || povInsight.trim());
  const previousData = getAllPreviousData("how_might_we");

  return (
    <StepPage stepKey="how_might_we" onSave={getData} canComplete={hasContent}>
      <LinkedDataBanner stepKey="how_might_we" />

      {/* POV Section */}
      <div className="sketch-border p-5 mb-6 bg-card">
        <h3 className="font-sketch text-lg mb-3 flex items-center gap-2"> הצהרת נקודת מבט (POV)</h3>
        <div className="sketch-border-thin p-4 mb-4 bg-secondary/20">
          <p className="text-base text-center text-muted-foreground">
            [משתמש] צריך [צורך] כי [תובנה]
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-semibold text-sm block mb-1">👤 משתמש</label>
            <input
              className="sketch-input"
              placeholder="מיהו המשתמש הספציפי?"
              value={povUser}
              onChange={(e) => setPovUser(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-sm block mb-1"> צורך</label>
            <input
              className="sketch-input"
              placeholder="מה הצורך של המשתמש?"
              value={povNeed}
              onChange={(e) => setPovNeed(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-sm block mb-1">🔍 תובנה</label>
            <input
              className="sketch-input"
              placeholder="למה? איזו תובנה מפתיעה גיליתם?"
              value={povInsight}
              onChange={(e) => setPovInsight(e.target.value)}
            />
          </div>
        </div>

        {(povUser || povNeed || povInsight) && (
          <div className="mt-4 sketch-border-thin p-4 bg-secondary/30 animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-1">ה-POV שלכם</p>
            <p className="text-lg leading-relaxed">
              <strong>{povUser || "___"}</strong> צריך <strong>{povNeed || "___"}</strong> כי <strong>{povInsight || "___"}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* HMW Section */}
      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-base text-muted-foreground flex-1">
             <strong>מה אם...?</strong> נסחו עד 3 שאלות פתיחה לפתרון.<br />
            לא רחב מדי, לא צר מדי.
          </p>
          <button
            onClick={inspireQuestions}
            className="sketch-btn-outline flex items-center gap-1 text-sm px-3 py-1.5"
            type="button"
          >
            <Sparkles className="h-4 w-4" /> השראה מה-POV
          </button>
          <SectionHelper stepKey="how_might_we" sectionKey="question" currentData={{ questions }} previousData={previousData} onApply={(v) => updateQuestion(0, v)} />
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-2 animate-fade-in">
            <span className="stage-number shrink-0 w-8 h-8 text-sm mt-1">{i + 1}</span>
            <input
              className="sketch-input flex-1"
              placeholder='איך נוכל… לעזור ל… ב…?'
              value={q}
              onChange={(e) => updateQuestion(i, e.target.value)}
            />
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(i)} className="mt-2 p-1 hover:bg-accent rounded-sm">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {questions.length < 3 && (
        <button onClick={addQuestion} className="sketch-btn-outline mt-4 flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> הוסף שאלה (עד 3)
        </button>
      )}
    </StepPage>
  );
};

export default HowMightWe;
