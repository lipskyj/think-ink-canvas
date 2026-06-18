import { useEffect, useState } from "react";
import { X, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useStepLSD } from "@/hooks/useStepLSD";
import { getStepByKey } from "@/lib/steps";
import noamCharacter from "@/assets/noam-character.jpg";

const SEEN_PREFIX = "lsd-seen-v1:";
const STAGES = ["learn", "see"] as const;
type Stage = (typeof STAGES)[number];

interface Props {
  stepKey: string;
}

/** Typewriter — character-by-character reveal, respects reduced-motion, click to skip. */
function Typewriter({
  text,
  speed = 16,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
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
      return;
    }
    setI(0);
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (done) return;
    if (i >= text.length) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setI((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [i, text, speed, done]);

  return (
    <span
      onClick={() => {
        setI(text.length);
        setDone(true);
      }}
      className={`cursor-text ${className}`}
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

export default function StepIntroModal({ stepKey }: Props) {
  const step = getStepByKey(stepKey);
  const seenKey = SEEN_PREFIX + stepKey;

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("learn");
  const { content, loading, isFallback, regenerate } = useStepLSD(stepKey, open);

  // Always open the intro on step mount — users don't remember step names/contents
  useEffect(() => {
    setOpen(true);
    setStage("learn");
  }, [stepKey]);

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

  const goNext = () => {
    if (stage === "learn") setStage("see");
    else close();
  };
  const goBack = () => {
    if (stage === "see") setStage("learn");
  };

  // Stage 1 of 2 indicator (dot row) — purely visual, no LEARN/SEE/DO labels
  const stageIdx = stage === "learn" ? 0 : 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`שלב ${step.num} — ${step.title}`}
    >
      {/* Strong vibrant blob backdrop — full screen */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" aria-hidden />
      <div className="vibe-backdrop vibe-backdrop-strong" aria-hidden>
        <span className="vibe-blob-3" />
        <span className="vibe-blob-4" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-3xl mx-auto px-6 sm:px-10 py-10 my-auto">
        {/* Skip */}
        <button
          onClick={close}
          className="absolute top-4 left-4 text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 text-sm font-sketch tracking-wider uppercase"
        >
          <X className="h-4 w-4" /> דלג
        </button>

        {/* Step chip */}
        <div className="text-center mb-6 mt-4 sm:mt-2">
          <span className="pill-chip pill-chip-coral">
            שלב {String(step.num).padStart(2, "0")}
          </span>
        </div>

        {/* HUGE display title — like the style-guide reference */}
        <h2 className="display-mega text-center mb-8 px-2 break-words">
          {step.title}
        </h2>

        {/* Glass body */}
        <div
          key={stage}
          className="relative rounded-3xl bg-card/85 backdrop-blur-md border-2 border-foreground p-6 sm:p-10 min-h-[220px] shadow-[6px_6px_0_hsl(var(--foreground))] animate-fade-in"
        >
          {loading && !content ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground font-hand">
              <Loader2 className="h-5 w-5 animate-spin" />
              מכין את זה לצוות שלכם...
            </div>
          ) : content ? (
            stage === "learn" ? (
              <Typewriter
                key={"learn-" + (content.learn?.length ?? 0)}
                text={content.learn}
                className="font-hand text-xl sm:text-2xl leading-relaxed whitespace-pre-line block"
              />
            ) : (
              <div className="space-y-6">
                {/* Storytelling situation — big card with character */}
                <div className="rounded-2xl border-2 border-foreground bg-accent/30 p-5 sm:p-6 shadow-[4px_4px_0_hsl(var(--foreground))]">
                  <div className="flex items-start gap-4">
                    <img
                      src={noamCharacter}
                      alt="נועם, דמות הסטודנט"
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-2 border-foreground object-cover shrink-0 shadow-[3px_3px_0_hsl(var(--foreground))]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="pill-chip pill-chip-coral text-[10px] mb-2">הכירו את נועם</div>
                      <p className="font-sketch text-xl sm:text-2xl leading-snug">
                        {content.see.context}
                      </p>
                    </div>
                  </div>
                </div>

                {/* What the team actually did */}
                <div>
                  <div className="pill-chip pill-chip-outline text-[10px] mb-3">מה הצוות עשה</div>
                  <Typewriter
                    key={"see-" + (content.see.execution?.length ?? 0)}
                    text={content.see.execution}
                    className="font-hand text-xl sm:text-2xl leading-relaxed whitespace-pre-line block"
                  />
                </div>
              </div>
            )
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-sketch tracking-wider uppercase text-muted-foreground">
            {/* Dot progress 1 of 2 */}
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

          <div className="flex items-center gap-2">
            {stage === "see" && (
              <button
                onClick={goBack}
                className="sketch-btn-outline text-sm"
              >
                חזרה ←
              </button>
            )}
            <button
              onClick={goNext}
              className="sketch-btn text-sm flex items-center gap-1"
            >
              {stage === "learn" ? "המשך →" : "בוא נעבוד →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
