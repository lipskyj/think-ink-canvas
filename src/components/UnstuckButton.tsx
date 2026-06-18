import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Zap, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { STEPS } from "@/lib/steps";

const UnstuckButton = () => {
  const location = useLocation();
  const { getStepData, getAllPreviousData } = useProject();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  // Find step by current URL
  const step = STEPS.find((s) => s.url === location.pathname);
  if (!step) return null;

  const run = async (mode: "unstuck" | "challenge") => {
    setLoading(true);
    setText("");
    setOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          mode,
          stepKey: step.key,
          stepTitle: step.title,
          currentData: getStepData(step.key) || {},
          previousData: getAllPreviousData(step.key),
        },
      });
      if (error) throw error;
      setText(data?.content || "אין תשובה. נסו שוב.");
    } catch (e: any) {
      setText("שגיאה: " + (e.message || "נסו שוב"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2" dir="rtl">
      {open && (
        <div className="sketch-card p-4 bg-background shadow-lg max-w-sm border-2 border-foreground">
          <div className="flex items-start gap-2 mb-2">
            <Zap className="text-amber-500" size={18} />
            <div className="flex-1 font-hand text-base whitespace-pre-wrap min-h-[3em]">
              {loading ? <Loader2 className="animate-spin" size={18} /> : text}
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => run("unstuck")} disabled={loading} className="shadow-lg">
          <Zap size={14} /> תקועים?
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("challenge")} disabled={loading} className="shadow-lg bg-background">
          ערערו עליי
        </Button>
      </div>
    </div>
  );
};

export default UnstuckButton;
