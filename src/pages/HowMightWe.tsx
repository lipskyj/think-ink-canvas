import { useState, useEffect, useCallback } from "react";
import { Plus, X, Sparkles, Check } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";

const HowMightWe = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [questions, setQuestions] = useState<string[]>([""]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // POV is imported (read-only) from previous step
  const pov = getStepData("pov_statement") || {};
  const povUser = pov.user || "";
  const povNeed = pov.need || "";
  const povInsight = pov.insight || "";

  useEffect(() => {
    const saved = getStepData("how_might_we");
    if (saved?.questions?.length) setQuestions(saved.questions);
    if (saved?.suggestions?.length) setSuggestions(saved.suggestions);
  }, [getStepData]);

  const addQuestion = () => {
    if (questions.length >= 5) return;
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
    setSuggestions([
      `איך נוכל לעזור ל${u} ${n}?`,
      `איך נוכל להפוך את "${i}" מבעיה ליתרון?`,
      `איך נוכל לחסוך ל${u} את הצורך ב${n}?`,
      `איך נוכל להפחית את החיכוך כאשר ${u} מנסה ${n}?`,
      `איך נוכל לעצב חוויה חדשה ל${u} שמתחשבת ב${i}?`,
    ]);
  };

  const pickSuggestion = (text: string) => {
    // Place in first empty slot, else append (cap at 5)
    const idx = questions.findIndex((q) => !q.trim());
    if (idx >= 0) {
      const updated = [...questions];
      updated[idx] = text;
      setQuestions(updated);
    } else if (questions.length < 5) {
      setQuestions([...questions, text]);
    }
    setSuggestions((prev) => prev.filter((s) => s !== text));
  };

  const getData = useCallback(
    () => ({ questions, suggestions, povUser, povNeed, povInsight }),
    [questions, suggestions, povUser, povNeed, povInsight]
  );
  const hasContent = questions.some((q) => q.trim());
  const previousData = getAllPreviousData("how_might_we");

  return (
    <StepPage stepKey="how_might_we" onSave={getData} canComplete={hasContent}>
      {/* POV read-only from previous step */}
      <div className="sketch-border p-5 mb-6 bg-card">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="pill-chip pill-chip-outline">ה-POV שלכם (משלב קודם)</span>
        </div>
        {povUser || povNeed || povInsight ? (
          <p className="text-xl leading-relaxed">
            <strong>{povUser || "___"}</strong>
            <span className="text-2xl font-bold text-primary mx-2">צריך</span>
            <strong>{povNeed || "___"}</strong>
            <span className="text-2xl font-bold text-primary mx-2">כי</span>
            <strong>{povInsight || "___"}</strong>.
          </p>
        ) : (
          <p className="font-hand text-muted-foreground">
            השלימו קודם את הצהרת ה-POV כדי שנציג אותה כאן.
          </p>
        )}
      </div>

      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-base text-muted-foreground flex-1">
            <strong>מה אם...?</strong> נסחו עד 5 שאלות פתיחה לפתרון.
            <br />
            לא רחב מדי, לא צר מדי.
          </p>
          <button
            onClick={inspireQuestions}
            className="sketch-btn-outline flex items-center gap-1 text-sm px-3 py-1.5"
            type="button"
          >
            <Sparkles className="h-4 w-4" /> חולל 5 הצעות מה-POV
          </button>
          <SectionHelper
            stepKey="how_might_we"
            sectionKey="question"
            currentData={{ questions }}
            previousData={previousData}
            onApply={(v) => updateQuestion(0, v)}
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="sketch-card mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="pill-chip pill-chip-outline">5 הצעות — בחרו את הטובות ביותר</span>
            <button
              onClick={() => setSuggestions([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              נקה הצעות
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 sketch-border bg-background hover:bg-accent/30 transition-colors"
              >
                <span className="font-hand text-sm text-muted-foreground shrink-0 mt-1">
                  הצעה {idx + 1}
                </span>
                <p className="flex-1 text-base leading-relaxed">{s}</p>
                <button
                  onClick={() => pickSuggestion(s)}
                  className="sketch-btn-outline text-sm flex items-center gap-1 shrink-0"
                  type="button"
                >
                  <Check className="h-3 w-3" /> בחר
                </button>
              </div>
            ))}
          </div>
          <p className="font-hand text-sm text-muted-foreground mt-3">
            טיפ: בחרו 1–2 שאלות שמרגישות הכי "פותחות" — לא רחבות מדי ולא צרות מדי.
          </p>
        </div>
      )}

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

      {questions.length < 5 && (
        <button onClick={addQuestion} className="sketch-btn-outline mt-4 flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> הוסף שאלה (עד 5)
        </button>
      )}
    </StepPage>
  );
};

export default HowMightWe;
