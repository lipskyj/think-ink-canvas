import { useState, useId } from "react";
import { Info, Sparkles, Loader2, X, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { SECTION_GUIDES } from "@/lib/sectionGuides";
import { useSectionHelper } from "@/contexts/SectionHelperContext";

interface SectionHelperProps {
  stepKey: string;
  sectionKey: string;
  currentData?: any;
  previousData?: Record<string, any>;
  onApply?: (value: string) => void;
}

export default function SectionHelper({ stepKey, sectionKey, currentData, previousData, onApply }: SectionHelperProps) {
  const { aiEnabled } = useAdmin();
  const instanceId = useId();
  const { openId, setOpenId } = useSectionHelper();
  const [aiResult, setAiResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  const guide = SECTION_GUIDES[stepKey]?.[sectionKey];
  if (!guide) return null;

  const tipId = `tip-${instanceId}`;
  const aiId = `ai-${instanceId}`;
  const showTip = openId === tipId;
  const showAI = openId === aiId;

  const toggleTip = () => setOpenId(showTip ? null : tipId);
  const toggleAI = () => {
    if (showAI) {
      setOpenId(null);
    } else {
      setOpenId(aiId);
      if (!aiResult) handleAI();
    }
  };

  const handleAI = async () => {
    setIsLoading(true);
    setError("");
    setAiResult("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey,
          stepTitle: sectionKey,
          mode: "section",
          sectionKey,
          sectionPrompt: guide.aiPrompt,
          currentData,
          previousData,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAiResult(data?.content || "לא התקבלה תשובה.");
    } catch (err: any) {
      console.error("Section AI error:", err);
      setError(err.message || "נכשל בקבלת תשובה מה-AI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-0.5 mr-1">
      {/* אייקון מידע */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleTip(); }}
        className="p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        aria-label="טיפ לסעיף"
        title="מה לכתוב כאן?"
      >
        <Info className="h-3 w-3" />
      </button>

      {/* אייקון AI */}
      {aiEnabled && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleAI(); }}
          disabled={isLoading}
          className="p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="הצעת AI"
          title="קבל הצעה מ-AI"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        </button>
      )}

      {/* פאנל טיפ */}
      {showTip && (
        <div className="absolute left-0 right-0 mt-1 top-full z-20">
          <div className="border-2 border-foreground/20 rounded-md bg-background shadow-lg p-3 text-xs relative">
            <button
              onClick={() => setOpenId(null)}
              className="absolute top-1 left-1 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-foreground leading-relaxed pl-4">
               {guide.tip}
            </p>
          </div>
        </div>
      )}

      {/* פאנל AI */}
      {showAI && (
        <div className="absolute left-0 right-0 mt-1 top-full z-20">
          <div className="border-2 border-foreground/20 rounded-md bg-background shadow-lg p-3 text-xs relative">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> הצעה
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAI}
                  disabled={isLoading}
                  className="p-0.5 text-muted-foreground hover:text-foreground"
                  title="צור מחדש"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => setOpenId(null)}
                  className="p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            {error && (
              <p className="text-destructive text-xs mb-1">{error}</p>
            )}
            {isLoading && !aiResult && (
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> חושב...
              </p>
            )}
            {aiResult && (
              <div>
                <p className="whitespace-pre-wrap leading-relaxed text-xs text-foreground mb-2">{aiResult}</p>
                {onApply && (
                  <button
                    onClick={() => {
                      onApply(aiResult);
                      setApplied(true);
                      setTimeout(() => { setOpenId(null); setApplied(false); }, 600);
                    }}
                    disabled={applied}
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                      applied
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-foreground text-background hover:bg-foreground/90 border border-foreground"
                    }`}
                  >
                    {applied ? <><Check className="h-3 w-3" /> הוחל</> : "השתמש בזה"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
