import { useEffect, useState } from "react";
import { CheckCircle2, X, Trophy, ArrowLeft } from "lucide-react";

export interface RecapItem {
  num: number;
  title: string;
  body: React.ReactNode;
}

interface PhaseRecapProps {
  storageKey: string;
  phaseNum: 1 | 2 | 3;
  headline: string;
  intro: string;
  items: RecapItem[];
  nextHint: string;
}

export default function PhaseRecap({
  storageKey,
  phaseNum,
  headline,
  intro,
  items,
  nextHint,
}: PhaseRecapProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  if (dismissed || items.length === 0) return null;

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    <div className="sketch-border p-7 md:p-8 mb-8 bg-secondary/50 relative animate-fade-in shadow-sm">
      <button
        onClick={dismiss}
        className="absolute top-3 left-3 p-1.5 hover:bg-accent rounded-sm transition-colors"
        aria-label="סגור"
        type="button"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--sun)/0.35)] shrink-0">
          <Trophy className="h-7 w-7" />
        </div>
        <div>
          <div className="pill-chip pill-chip-coral inline-block mb-1">פאזה {phaseNum} הושלמה</div>
          <h2 className="font-sketch text-3xl md:text-4xl leading-tight">{headline}</h2>
        </div>
      </div>

      <p className="font-hand text-lg text-muted-foreground mb-6 leading-relaxed">{intro}</p>

      <div className="space-y-4">
        {items.map((it) => (
          <div
            key={it.num}
            className="flex items-start gap-4 p-4 rounded-md bg-background/70 border border-foreground/10"
          >
            <span className="stage-number shrink-0 w-9 h-9 text-sm mt-0.5">{it.num}</span>
            <div className="flex-1 min-w-0">
              <div className="font-sketch text-lg mb-1">{it.title}</div>
              <div className="text-foreground/85 leading-relaxed text-base break-words">
                {it.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-foreground/15">
        <ArrowLeft className="h-5 w-5 text-foreground/70 shrink-0" />
        <p className="font-hand text-base text-foreground/80">{nextHint}</p>
      </div>
    </div>
  );
}
