import { useState } from "react";
import { Sparkles, Loader2, X, Wand2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantProps {
  stepKey: string;
  stepTitle: string;
  currentData: any;
  previousData: Record<string, any>;
  onClose: () => void;
}

export default function AIAssistant({ stepKey, stepTitle, currentData, previousData, onClose }: AIAssistantProps) {
  const [mode, setMode] = useState<"suggest" | "review">("suggest");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey,
          stepTitle,
          mode,
          currentData,
          previousData,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResult(data?.content || "לא התקבלה תשובה.");
    } catch (err: any) {
      console.error("AI error:", err);
      setError(err.message || "נכשל בקבלת תשובה מה-AI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sketch-border p-4 mb-6 bg-secondary/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sketch text-sm flex items-center gap-1">
          <Sparkles className="h-4 w-4" /> עוזר AI
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-accent rounded-sm">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("suggest")}
          className={`text-xs px-3 py-1.5 font-sketch flex items-center gap-1 ${
            mode === "suggest"
              ? "sketch-border bg-foreground text-primary-foreground"
              : "sketch-border-thin"
          }`}
        >
          <Wand2 className="h-3 w-3" /> הצע
        </button>
        <button
          onClick={() => setMode("review")}
          className={`text-xs px-3 py-1.5 font-sketch flex items-center gap-1 ${
            mode === "review"
              ? "sketch-border bg-foreground text-primary-foreground"
              : "sketch-border-thin"
          }`}
        >
          <MessageSquare className="h-3 w-3" /> סקור
        </button>
      </div>

      <p className="font-hand text-sm text-muted-foreground mb-3">
        {mode === "suggest"
          ? `ה-AI ייצור הצעות ל${stepTitle} על סמך העבודה הקודמת שלך.`
          : `ה-AI יסקור את ה${stepTitle} הנוכחי שלך ויציע שיפורים.`}
      </p>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="sketch-btn text-sm flex items-center gap-2 mb-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> חושב...
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" /> {mode === "suggest" ? "צור הצעות" : "סקור את העבודה שלי"}
          </>
        )}
      </button>

      {error && (
        <div className="sketch-border-thin p-3 bg-destructive/10 mb-3">
          <p className="font-hand text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <div className="sketch-border-thin p-4 bg-card notebook-lines">
          <p className="font-hand text-base whitespace-pre-wrap leading-[32px]">{result}</p>
        </div>
      )}
    </div>
  );
}
