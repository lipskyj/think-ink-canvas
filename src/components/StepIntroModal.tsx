import { useEffect, useState } from "react";
import { X, ArrowLeft, ArrowRight, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useStepLSD } from "@/hooks/useStepLSD";
import { getStepByKey } from "@/lib/steps";

const SEEN_PREFIX = "lsd-seen-v1:";

interface Props {
  stepKey: string;
}

/**
 * Fullscreen Learn → See intro for a step.
 * Sequence: LEARN page → SEE page → close (the underlying page is the DO).
 * Auto-opens on first visit per step. User can skip at any time.
 * After dismissal, can be re-opened via the small "intro" button rendered by StepPage.
 */
export default function StepIntroModal({ stepKey }: Props) {
  const step = getStepByKey(stepKey);
  const seenKey = SEEN_PREFIX + stepKey;

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"learn" | "see">("learn");
  const { content, loading, isFallback, regenerate } = useStepLSD(stepKey, open);

  // Auto-open once per step (first visit).
  useEffect(() => {
    try {
      if (!localStorage.getItem(seenKey)) {
        setOpen(true);
        setStage("learn");
      }
    } catch {}
  }, [seenKey]);

  // Listen for global event to re-open from header button.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.stepKey === stepKey) {
        setOpen(true);
        setStage("learn");
      }
    };
    window.addEventListener("lsd:open", handler as EventListener);
    return () => window.removeEventListener("lsd:open", handler as EventListener);
  }, [stepKey]);

  const close = () => {
    try {
      localStorage.setItem(seenKey, "1");
    } catch {}
    setOpen(false);
  };

  if (!open || !step) return null;

  const isLearn = stage === "learn";

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-stretch sm:items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={isLearn ? "Learn" : "See"}
    >
      <div className="relative w-full max-w-2xl mx-auto p-6 sm:p-10 my-auto">
        {/* Skip */}
        <button
          onClick={close}
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-hand"
          aria-label="דלג"
        >
          <X className="h-4 w-4" /> דלג והתחל לעבוד
        </button>

        {/* Stage indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 mt-6 sm:mt-2 font-hand text-sm text-muted-foreground">
          <span className={isLearn ? "text-foreground font-sketch" : ""}>📖 Learn</span>
          <span>→</span>
          <span className={!isLearn ? "text-foreground font-sketch" : ""}>👀 See</span>
          <span>→</span>
          <span>🛠️ Do</span>
        </div>

        <div className="text-center mb-4">
          <div className="text-xs font-hand text-muted-foreground">
            שלב {step.num} · {step.title}
          </div>
          <h2 className="font-sketch text-3xl sm:text-4xl mt-1">
            {isLearn ? "📖 רגע למחשבה" : "👀 ככה זה נראה בשטח"}
          </h2>
        </div>

        <div className="sketch-border bg-background p-6 sm:p-8 min-h-[200px]">
          {loading && !content ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground font-hand">
              <Loader2 className="h-5 w-5 animate-spin" />
              מכין הקדמה מותאמת לצוות שלכם...
            </div>
          ) : content ? (
            isLearn ? (
              <p className="font-hand text-xl leading-relaxed whitespace-pre-line">
                {content.learn}
              </p>
            ) : (
              <div className="space-y-4">
                <div className="font-hand text-base text-muted-foreground">
                  <span className="font-sketch">הסיטואציה: </span>
                  {content.see.context}
                </div>
                <p className="font-hand text-xl leading-relaxed whitespace-pre-line">
                  {content.see.execution}
                </p>
              </div>
            )
          ) : null}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-hand text-muted-foreground">
            {isFallback ? (
              <button
                onClick={() => regenerate()}
                disabled={loading}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                ערבבו מחדש
              </button>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> נוצר לצוות שלכם
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLearn ? (
              <>
                <button onClick={close} className="sketch-btn-outline text-sm">
                  קפצו ל-Do
                </button>
                <button
                  onClick={() => setStage("see")}
                  className="sketch-btn text-sm flex items-center gap-1"
                >
                  הבא: See <ArrowLeft className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStage("learn")}
                  className="sketch-btn-outline text-sm flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" /> חזרה ל-Learn
                </button>
                <button onClick={close} className="sketch-btn text-sm flex items-center gap-1">
                  🛠️ בואו נעשה זאת
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
