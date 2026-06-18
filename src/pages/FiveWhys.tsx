import { useState, useEffect, useCallback, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import LinkedDataBanner from "@/components/LinkedDataBanner";
import SectionHelper from "@/components/SectionHelper";
import { useAutoFill } from "@/hooks/useAutoFill";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

const labels = ["למה 1", "למה 2", "למה 3", "למה 4", "למה 5"];

const FiveWhys = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const { aiEnabled } = useAdmin();
  const [problem, setProblem] = useState("");
  const [whys, setWhys] = useState<string[]>(["", "", "", "", ""]);
  const [suggestions, setSuggestions] = useState<Record<number, string[]>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const saved = getStepData("five_whys");
    if (saved) {
      if (saved.problem) setProblem(saved.problem);
      if (saved.whys) setWhys(saved.whys);
    }
  }, [getStepData]);

  // Auto-fill problem from POV
  const autoFillFields = useMemo(() => ({
    problem: { value: problem, set: setProblem },
  }), [problem]);
  useAutoFill("five_whys", autoFillFields);

  const handleApplyLinked = (field: string, value: string) => {
    if (field === "problem" && !problem.trim()) setProblem(value);
  };

  const updateWhy = (i: number, val: string) => {
    const updated = [...whys];
    updated[i] = val;
    setWhys(updated);
  };

  // Determine how many whys to show: first unanswered + all answered
  const visibleCount = useMemo(() => {
    if (!problem.trim()) return 0;
    for (let i = 0; i < 5; i++) {
      if (!whys[i].trim()) return i + 1;
    }
    return 5;
  }, [problem, whys]);

  const previousData = getAllPreviousData("five_whys");

  const fetchSuggestions = useCallback(async (whyIndex: number) => {
    setLoadingSuggestions(prev => ({ ...prev, [whyIndex]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey: "five_whys",
          stepTitle: "חמישה למה",
          mode: "why_suggestions",
          currentData: { problem, whys, whyIndex },
          previousData,
        },
      });
      if (error) throw error;
      if (data?.suggestions) {
        setSuggestions(prev => ({ ...prev, [whyIndex]: data.suggestions }));
      }
    } catch (err) {
      console.error("Why suggestions error:", err);
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [whyIndex]: false }));
    }
  }, [problem, whys, previousData]);

  // Auto-fetch suggestions when a new why level becomes visible and is empty
  useEffect(() => {
    if (!aiEnabled) return;
    for (let i = 0; i < visibleCount; i++) {
      if (!whys[i].trim() && !suggestions[i] && !loadingSuggestions[i]) {
        // Only fetch if there's enough context (problem filled, and for i>0, previous why filled)
        if (i === 0 && problem.trim()) {
          fetchSuggestions(i);
        } else if (i > 0 && whys[i - 1].trim()) {
          fetchSuggestions(i);
        }
      }
    }
  }, [visibleCount, aiEnabled]);

  const getData = useCallback(() => ({ problem, whys }), [problem, whys]);
  const hasContent = !!(problem.trim() || whys.some(w => w.trim()));

  return (
    <StepPage stepKey="five_whys" onSave={getData} canComplete={hasContent}>
      <LinkedDataBanner stepKey="five_whys" onApplyField={handleApplyLinked} />

      <div className="sketch-card mb-6">
        <div className="flex items-center relative">
          <label className="font-semibold text-lg block mb-2"> הבעיה</label>
          <SectionHelper stepKey="five_whys" sectionKey="problem" currentData={{ problem, whys }} previousData={previousData} onApply={(v) => setProblem(v)} />
        </div>
        <input className="sketch-input" placeholder="נסחו את הבעיה שברצונכם לחקור..." value={problem} onChange={(e) => setProblem(e.target.value)} />
      </div>

      {visibleCount > 0 && (
        <div className="relative">
          <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-foreground/30" />
          <div className="space-y-4">
            {labels.slice(0, visibleCount).map((label, i) => (
              <div key={i} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="stage-number shrink-0 z-10 bg-background">{i + 1}</div>
                <div className="flex-1 sketch-card">
                  <div className="flex items-center relative">
                    <label className="font-semibold text-sm block mb-2">{label}: למה?</label>
                    <SectionHelper stepKey="five_whys" sectionKey="why" currentData={{ problem, whys, currentWhy: i }} previousData={previousData} onApply={(v) => updateWhy(i, v)} />
                  </div>
                  <input className="sketch-input" placeholder={i === 0 ? "למה הבעיה הזו קורה?" : "למה זה כך?"} value={whys[i]} onChange={(e) => updateWhy(i, e.target.value)} />

                  {/* AI Suggestions */}
                  {aiEnabled && !whys[i].trim() && (
                    <div className="mt-2">
                      {loadingSuggestions[i] && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> מחפש הצעות...
                        </p>
                      )}
                      {suggestions[i] && suggestions[i].length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">הצעות — לחצו לבחירה:</span>
                            <button
                              onClick={() => fetchSuggestions(i)}
                              disabled={loadingSuggestions[i]}
                              className="p-0.5 text-muted-foreground hover:text-foreground mr-1"
                              title="הצעות חדשות"
                            >
                              {loadingSuggestions[i] ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            </button>
                          </div>
                          {suggestions[i].map((s, si) => (
                            <button
                              key={si}
                              onClick={() => {
                                updateWhy(i, s);
                                setSuggestions(prev => {
                                  const next = { ...prev };
                                  delete next[i];
                                  return next;
                                });
                              }}
                              className="block w-full text-right text-xs px-3 py-2 rounded-md border border-border hover:bg-secondary/50 hover:border-foreground/30 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      {!loadingSuggestions[i] && !suggestions[i] && (
                        <button
                          onClick={() => fetchSuggestions(i)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" /> הצג הצעות
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!problem.trim() && (
        <p className="text-sm text-muted-foreground text-center mt-6">
           הזינו את הבעיה כדי להתחיל את שרשרת ה"למה"
        </p>
      )}

      {whys[4] && (
        <div className="mt-6 sketch-border p-5 bg-secondary/30 animate-fade-in">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2"> שורש הבעיה</h3>
          <p className="text-xl">{whys[4]}</p>
        </div>
      )}
    </StepPage>
  );
};

export default FiveWhys;
