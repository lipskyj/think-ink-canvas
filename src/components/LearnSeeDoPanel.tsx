import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearnSeeDo } from "@/hooks/useLearnSeeDo";
import { PHASE_LABELS } from "@/content/lsd-fallback";
import type { BlockKey } from "@/lib/hackathon";

const STORAGE_PREFIX = "lsd-open-";

interface Props {
  phase: BlockKey;
}

const LearnSeeDoPanel = ({ phase }: Props) => {
  const { content, loading, isFallback, regenerate } = useLearnSeeDo(phase);
  const label = PHASE_LABELS[phase];

  const storageKey = STORAGE_PREFIX + phase;
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== "closed";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, open ? "open" : "closed");
    } catch {}
  }, [open, storageKey]);

  return (
    <div className="sketch-border p-4 mb-6 bg-background/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-right"
      >
        <span className="text-2xl">{label.emoji}</span>
        <div className="flex-1">
          <div className="text-xs font-hand text-muted-foreground">לוח כניסה לפאזה</div>
          <h2 className="font-sketch text-xl">{label.title} — Learn · See · Do</h2>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin opacity-60" />}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <section className="sketch-card">
            <div className="font-sketch text-lg mb-2">🚀 LEARN — דקה של מיינדסט</div>
            <p className="font-hand text-base leading-relaxed whitespace-pre-line">
              {content.learn}
            </p>
          </section>

          <section className="sketch-card">
            <div className="font-sketch text-lg mb-2">👀 SEE — דוגמה מהשטח</div>
            <div className="font-hand text-sm mb-2">
              <span className="font-sketch">הסיטואציה: </span>
              {content.see.context}
            </div>
            <p className="font-hand text-base leading-relaxed whitespace-pre-line">
              {content.see.execution}
            </p>
          </section>

          <section className="sketch-card">
            <div className="font-sketch text-lg mb-2">🛠️ DO — התור שלכם בזירה</div>
            <div className="font-hand text-base mb-2">
              <span className="font-sketch">המטרה: </span>
              {content.do.objective}
            </div>
            <ol className="list-decimal pr-5 space-y-1 font-hand text-base mb-3">
              {content.do.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <div className="sketch-border p-2 bg-muted/30 font-hand text-sm">
              <span className="font-sketch">תבנית למילוי: </span>
              {content.do.formula}
            </div>
          </section>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="text-xs font-hand text-muted-foreground">
              {isFallback ? "תוכן ברירת מחדל — לחצו לערבוב חי" : "נוצר עבור הצוות שלכם"}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => regenerate()}
              disabled={loading}
              className="gap-1"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              ערבבו מחדש
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnSeeDoPanel;
