import { useEffect, useState } from "react";
import { X, Loader2, RefreshCw, Sparkles, BookOpen, Eye } from "lucide-react";
import { useStepLSD } from "@/hooks/useStepLSD";
import { getStepByKey } from "@/lib/steps";
import { getDemoStep } from "@/lib/demoSteps";

const SEEN_PREFIX = "lsd-seen-v1:";
const STAGES = ["learn", "see"] as const;
type Stage = (typeof STAGES)[number];

interface Props {
  stepKey: string;
  onClose?: () => void;
}

/** Typewriter — character-by-character reveal, respects reduced-motion, click to skip. */
function Typewriter({
  text,
  speed = 16,
  className = "",
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setI(text.length);
      setDone(true);
      onDone?.();
      return;
    }
    setI(0);
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (done) return;
    if (i >= text.length) {
      setDone(true);
      onDone?.();
      return;
    }
    const t = setTimeout(() => setI((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [i, text, speed, done]);

  return (
    <span
      className={className}
    >
      {text.slice(0, i)}
      {!done && (
        <span className="inline-block w-[0.5ch] -mb-1 animate-pulse text-[hsl(var(--primary))]">
          ▍
        </span>
      )}
    </span>
  );
}

export default function StepIntroModal({ stepKey, onClose }: Props) {
  const step = getStepByKey(stepKey);
  const seenKey = SEEN_PREFIX + stepKey;

  const [stage, setStage] = useState<Stage>("learn");
  const [learnDone, setLearnDone] = useState(false);
  const [seeDone, setSeeDone] = useState(false);
  const demo = getDemoStep(stepKey);
  const { content: lsdContent, loading, isFallback, regenerate } = useStepLSD(stepKey, !demo);
  // Prefer hand-crafted demo content when available; fall back to AI/LSD otherwise.
  const learnText = demo?.learn || lsdContent?.learn || "";
  const hasContent = !!(demo || lsdContent);

  useEffect(() => {
    setStage("learn");
    setLearnDone(false);
    setSeeDone(false);
  }, [stepKey]);

  const close = () => {
    try {
      localStorage.setItem(seenKey, "1");
    } catch {}
    onClose?.();
  };

  if (!step) return null;

  const goNext = () => {
    if (stage === "learn") setStage("see");
    else close();
  };
  const goBack = () => {
    if (stage === "see") setStage("learn");
  };

  const stageIdx = stage === "learn" ? 0 : 1;

  return (
    <section
      className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-6"
      aria-label={`שלב ${step.num} — ${step.title}`}
    >
      {/* Skip — only after the typewriter for the current stage is done */}
      <div className="flex justify-start mb-4 min-h-[24px]">
        {((stage === "learn" && learnDone) || (stage === "see" && seeDone)) && (
          <button
            onClick={close}
            className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 text-sm font-sketch tracking-wider uppercase animate-fade-in"
          >
            <X className="h-4 w-4" /> דלג
          </button>
        )}
      </div>

      {/* Step chip */}
      <div className="text-center mb-6">
        <span className="pill-chip pill-chip-coral">
          שלב {String(step.num).padStart(2, "0")}
        </span>
      </div>

      {/* HUGE display title */}
      <h2 className="display-mega text-center mb-8 px-2 break-words">
        {step.title}
      </h2>

      {/* Body */}
      <div
        key={stage}
        className="relative rounded-3xl bg-card border-2 border-foreground p-6 sm:p-10 min-h-[220px] shadow-[6px_6px_0_hsl(var(--foreground))] animate-fade-in"
      >
        {loading && !hasContent ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground font-hand">
            <Loader2 className="h-5 w-5 animate-spin" />
            מכין את זה לצוות שלכם...
          </div>
        ) : hasContent ? (
          stage === "learn" ? (
            <Typewriter
              key={"learn-" + learnText.length}
              text={learnText}
              className="font-hand text-xl sm:text-2xl leading-relaxed whitespace-pre-line block"
              onDone={() => setLearnDone(true)}
            />
          ) : (
            // SEE stage — show the real worked example for this step
            <div className="space-y-4" onAnimationEnd={() => setSeeDone(true)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="pill-chip pill-chip-coral text-[10px] flex items-center gap-1">
                  <Eye className="h-3 w-3" /> דוגמה אמיתית לשלב הזה
                </span>
                {demo && (
                  <span className="pill-chip pill-chip-outline text-[10px]">
                    מה הקבוצה כתבה
                  </span>
                )}
              </div>
              {demo ? (
                <div className="font-hand text-base sm:text-lg leading-relaxed">
                  <p className="mb-3 text-muted-foreground">
                    <strong>מה עושים:</strong> {demo.what}
                  </p>
                  <div className="sketch-border-thin p-4 bg-secondary/20">
                    {demo.output}
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-sketch text-lg sm:text-xl leading-snug">
                    {lsdContent?.see.context}
                  </p>
                  <Typewriter
                    key={"see-" + (lsdContent?.see.execution?.length ?? 0)}
                    text={lsdContent?.see.execution || ""}
                    className="font-hand text-xl sm:text-2xl leading-relaxed whitespace-pre-line block"
                    onDone={() => setSeeDone(true)}
                  />
                </>
              )}
              {/* Auto-mark see as done when demo (static) is shown */}
              {demo && <DoneOnMount onDone={() => setSeeDone(true)} />}
            </div>
          )
        ) : null}
      </div>


      {/* Footer */}
      <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-sketch tracking-wider uppercase text-muted-foreground">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${stageIdx === 0 ? "bg-primary" : "bg-foreground/20"}`}
          />
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${stageIdx === 1 ? "bg-primary" : "bg-foreground/20"}`}
          />
          <span className="ml-2">
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
          </span>
        </div>

        <div className="flex items-center gap-2 min-h-[40px]">
          {stage === "see" && (
            <button onClick={goBack} className="sketch-btn-outline text-sm">
              → חזרה
            </button>
          )}
          {((stage === "learn" && learnDone) || (stage === "see" && seeDone)) && (
            <button
              onClick={goNext}
              className="sketch-btn text-sm flex items-center gap-1 animate-fade-in"
            >
              {stage === "learn" ? "המשך ←" : "בוא נעבוד ←"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
