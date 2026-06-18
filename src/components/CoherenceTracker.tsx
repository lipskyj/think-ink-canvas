import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";

interface CoherenceTrackerProps {
  stepKey: string;
  currentData: any;
}

export default function CoherenceTracker({ stepKey, currentData }: CoherenceTrackerProps) {
  const { getAllPreviousData } = useProject();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  const checkCoherence = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const previousData = getAllPreviousData(stepKey);
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey,
          stepTitle: stepKey,
          mode: "coherence",
          currentData,
          previousData,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data?.content || "אין ניתוח זמין.");
      setHasChecked(true);
    } catch (err: any) {
      console.error("Coherence check error:", err);
      setResult("לא ניתן לבדוק קוהרנטיות: " + (err.message || "שגיאה לא ידועה"));
    } finally {
      setIsLoading(false);
    }
  };

  const solutionSteps = ["ideation", "prototype_brief", "user_testing"];
  if (!solutionSteps.includes(stepKey)) return null;

  return (
    <div className="mb-6">
      {!hasChecked ? (
        <button
          onClick={checkCoherence}
          disabled={isLoading}
          className="sketch-btn-outline text-sm flex items-center gap-2"
        >
          {isLoading ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> בודק קוהרנטיות...</>
          ) : (
            <><AlertTriangle className="h-3 w-3" /> בדוק התאמה להגדרת הבעיה</>
          )}
        </button>
      ) : (
        <div className="sketch-border-thin bg-secondary/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> בדיקת קוהרנטיות
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={checkCoherence}
                disabled={isLoading}
                className="p-1 text-muted-foreground hover:text-foreground"
                title="בדוק שוב"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          {expanded && result && (
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {result}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
