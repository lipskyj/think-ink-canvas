import { useState, useEffect, useCallback } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import { STEPS } from "@/lib/steps";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STEP_LABELS: Record<string, string> = {
  empathy_map: "מפת אמפתיה",
  converge: "התכנסות",
  user_persona: "פרסונת משתמש",
  jtbd: "משימות לביצוע",
  journey_map: "מפת מסע",
  pov_statement: "הצהרת נקודת מבט",
  how_might_we: "איך נוכל",
  five_whys: "חמישה למה",
  ideation: "יצירת רעיונות",
  assumption_selection: "הנחות",
  storyboard: "סטוריבורד",
  prototype_brief: "בריף אב-טיפוס",
  user_testing: "בדיקות משתמשים",
};

const PrdGenerator = () => {
  const { getStepData, stepData } = useProject();
  const { toast } = useToast();
  const [prdOutput, setPrdOutput] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const saved = getStepData("prd_generator");
    if (saved) {
      if (saved.prdOutput) setPrdOutput(saved.prdOutput);
      if (saved.additionalNotes) setAdditionalNotes(saved.additionalNotes);
    }
  }, [getStepData]);

  // Collect all previous step data
  const collectAllData = useCallback(() => {
    const allData: Record<string, any> = {};
    STEPS.forEach((step) => {
      if (step.key === "prd_generator") return;
      const data = getStepData(step.key);
      if (data && Object.keys(data).length > 0) {
        allData[step.key] = data;
      }
    });
    return allData;
  }, [getStepData]);

  const filledSteps = STEPS.filter(
    (s) => s.key !== "prd_generator" && stepData[s.key]?.data && Object.keys(stepData[s.key].data).length > 0
  );
  const emptySteps = STEPS.filter(
    (s) => s.key !== "prd_generator" && (!stepData[s.key]?.data || Object.keys(stepData[s.key].data).length === 0)
  );

  const generatePRD = async () => {
    setGenerating(true);
    try {
      const allData = collectAllData();
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey: "prd_generator",
          stepTitle: "PRD Generator",
          mode: "prd_generate",
          currentData: { additionalNotes },
          previousData: allData,
        },
      });
      if (error) throw error;
      if (data?.content) {
        setPrdOutput(data.content);
        toast({ title: "PRD נוצר בהצלחה! " });
      }
    } catch (e: any) {
      toast({ title: "שגיאה ביצירת PRD", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prdOutput);
    setCopied(true);
    toast({ title: "הועתק ללוח! ✓" });
    setTimeout(() => setCopied(false), 2000);
  };

  const getData = useCallback(() => ({ prdOutput, additionalNotes }), [prdOutput, additionalNotes]);
  const hasContent = prdOutput.trim().length > 0;

  return (
    <StepPage stepKey="prd_generator" onSave={getData} canComplete={hasContent}>
      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <p className="font-hand text-lg text-muted-foreground">
           שלב זה אוסף את כל מה שעבדתם עליו ומייצר פרומפט PRD מוכן להדבקה במערכת text-to-code כמו Lovable.
        </p>
      </div>

      {/* Data summary */}
      <div className="sketch-card mb-6">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="font-sketch text-lg">📊 סיכום הנתונים שלכם</span>
            <span className="text-sm text-muted-foreground font-hand">
              ({filledSteps.length}/{STEPS.length - 1} שלבים מולאו)
            </span>
          </div>
          {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showSummary && (
          <div className="mt-4 space-y-2">
            {filledSteps.map((step) => (
              <div key={step.key} className="flex items-center gap-2 text-sm">
                <span className="text-primary">✅</span>
                <span className="font-hand">{STEP_LABELS[step.key] || step.title}</span>
              </div>
            ))}
            {emptySteps.map((step) => (
              <div key={step.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>⬜</span>
                <span className="font-hand">{STEP_LABELS[step.key] || step.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional notes */}
      <div className="sketch-card mb-6">
        <label className="font-sketch text-lg block mb-2">📝 הערות נוספות (אופציונלי)</label>
        <p className="font-hand text-muted-foreground text-sm mb-2">
          דרישות טכניות, העדפות עיצוב, או כל מידע נוסף שתרצו לכלול ב-PRD
        </p>
        <textarea
          className="sketch-input min-h-[80px] resize-none notebook-lines"
          placeholder="לדוגמה: המוצר צריך לעבוד במובייל, ממשק בעברית, שימוש ב-React..."
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
        />
      </div>

      {/* Generate button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generatePRD}
          disabled={generating || filledSteps.length === 0}
          className="sketch-btn flex items-center gap-2 text-lg px-8 py-3 disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              מייצר PRD...
            </>
          ) : prdOutput ? (
            <>
              <RefreshCw className="h-5 w-5" />
              ייצור מחדש
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              צור PRD / פרומפט
            </>
          )}
        </button>
      </div>

      {filledSteps.length === 0 && (
        <p className="text-center text-muted-foreground font-hand text-sm mb-6">
          ⚠️ עליכם למלא לפחות שלב אחד לפני יצירת PRD
        </p>
      )}

      {/* PRD Output */}
      {prdOutput && (
        <div className="sketch-card">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <label className="font-sketch text-lg">📄 ה-PRD שנוצר</label>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="sketch-btn-outline text-sm flex items-center gap-1.5 px-3 py-1.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "הועתק!" : "העתק ללוח"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(prdOutput);
                  window.open("https://lovable.dev/", "_blank");
                  toast({ title: "הפרומפט הועתק — הדביקו ב-Lovable " });
                }}
                className="sketch-btn text-sm flex items-center gap-1.5 px-3 py-1.5"
              >
                 פתחו ב-Lovable
              </button>
            </div>
          </div>
          <textarea
            className="sketch-input min-h-[400px] resize-y notebook-lines font-mono text-sm leading-relaxed"
            value={prdOutput}
            onChange={(e) => setPrdOutput(e.target.value)}
            dir="ltr"
          />
          <div className="mt-4 sketch-border-thin p-3 bg-secondary/20">
            <p className="font-sketch text-sm mb-2">✅ צ׳קליסט דמו (לפני שעולים לבמה):</p>
            <ul className="font-hand text-sm space-y-1">
              <li>☐ זרימה ראשית עובדת מקצה לקצה</li>
              <li>☐ נתונים פיקטיביים יפים (לא Lorem)</li>
              <li>☐ צילום מסך / מובייל מוכן לפיץ׳</li>
              <li>☐ רגע אחד של ״וואו״ — אנימציה, AI, או הפתעה</li>
            </ul>
          </div>
        </div>
      )}
    </StepPage>
  );
};

export default PrdGenerator;
