import { useEffect, useRef, useState } from "react";
import { X, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useStepLSD } from "@/hooks/useStepLSD";
import { getStepByKey } from "@/lib/steps";

const SEEN_PREFIX = "lsd-seen-v1:";
const STAGES = ["learn", "see", "do"] as const;
type Stage = (typeof STAGES)[number];

interface Props {
  stepKey: string;
}

/* ---------------- Typewriter ---------------- */
function Typewriter({
  text,
  speed = 18,
  onDone,
  className = "",
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setI(reduced.current ? text.length : 0);
    setDone(reduced.current);
  }, [text]);

  useEffect(() => {
    if (done || reduced.current) return;
    if (i >= text.length) {
      setDone(true);
      onDone?.();
      return;
    }
    const t = setTimeout(() => setI((n) => n + 1), speed);
    return () => clearTimeout(t);
  }, [i, text, speed, done, onDone]);

  const finish = () => {
    setI(text.length);
    setDone(true);
    onDone?.();
  };

  return (
    <span onClick={finish} className={`cursor-text ${className}`}>
      {text.slice(0, i)}
      {!done && (
        <span className="inline-block w-[0.55ch] -mb-1 animate-[caret_0.9s_steps(2)_infinite] text-[hsl(var(--primary))]">
          ▍
        </span>
      )}
    </span>
  );
}

/* ---------------- Stage word (huge gradient or outlined) ---------------- */
function StageWord({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`font-sketch font-black uppercase tracking-tight transition-all duration-500 select-none ${
        active
          ? "text-[clamp(2.2rem,7vw,5rem)] lsd-gradient-text animate-[gradientPan_6s_ease_infinite,hueShift_12s_linear_infinite]"
          : "text-[clamp(1.4rem,4vw,2.6rem)] lsd-outline-text opacity-60"
      }`}
    >
      {label}
    </span>
  );
}

export default function StepIntroModal({ stepKey }: Props) {
  const step = getStepByKey(stepKey);
  const seenKey = SEEN_PREFIX + stepKey;

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("learn");
  const { content, loading, isFallback, regenerate } = useStepLSD(stepKey, open);

  useEffect(() => {
    try {
      if (!localStorage.getItem(seenKey)) {
        setOpen(true);
        setStage("learn");
      }
    } catch {}
  }, [seenKey]);

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
    else if (stage === "see") close(); // "do" = the page itself
  };
  const goBack = () => {
    if (stage === "see") setStage("learn");
  };

  return (
    <>
      {/* Local keyframes — Gen-Z motion */}
      <style>{`
        @keyframes gradientPan {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes hueShift {
          0%,100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(60deg); }
        }
        @keyframes caret {
          0%,49% { opacity: 1; }
          50%,100% { opacity: 0; }
        }
        @keyframes blobA {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(8vw,-6vh) scale(1.15); }
        }
        @keyframes blobB {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-10vw,8vh) scale(1.2); }
        }
        @keyframes blobC {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(6vw,10vh) scale(0.9); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(8deg); }
        }
        .lsd-gradient-text {
          background-image: linear-gradient(110deg, #ff3df5 0%, #00e5ff 30%, #b6ff3d 60%, #ff7a00 90%, #ff3df5 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .lsd-outline-text {
          color: transparent;
          -webkit-text-stroke: 1.5px hsl(var(--foreground));
        }
        .lsd-stage-enter {
          animation: stageIn 0.5s cubic-bezier(.2,.8,.2,1);
        }
        @keyframes stageIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); filter: blur(6px); }
          100% { opacity: 1; transform: none; filter: none; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={stage.toUpperCase()}
      >
        {/* Animated mesh backdrop */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" aria-hidden />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div
            className="absolute -top-32 -left-24 w-[55vmax] h-[55vmax] rounded-full opacity-50 blur-3xl"
            style={{
              background: "radial-gradient(circle, #ff3df5 0%, transparent 60%)",
              animation: "blobA 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/3 -right-32 w-[50vmax] h-[50vmax] rounded-full opacity-50 blur-3xl"
            style={{
              background: "radial-gradient(circle, #00e5ff 0%, transparent 60%)",
              animation: "blobB 22s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-32 left-1/4 w-[45vmax] h-[45vmax] rounded-full opacity-50 blur-3xl"
            style={{
              background: "radial-gradient(circle, #b6ff3d 0%, transparent 60%)",
              animation: "blobC 26s ease-in-out infinite",
            }}
          />
          {/* floating glyphs */}
          <span className="absolute top-[12%] right-[14%] text-3xl opacity-70" style={{ animation: "floatY 5s ease-in-out infinite" }}>✦</span>
          <span className="absolute bottom-[18%] left-[10%] text-2xl opacity-60" style={{ animation: "floatY 7s ease-in-out infinite" }}>✺</span>
          <span className="absolute top-[40%] left-[6%] text-xl opacity-50" style={{ animation: "floatY 6s ease-in-out infinite" }}>⊹</span>
        </div>

        {/* Content */}
        <div className="relative w-full max-w-3xl mx-auto px-6 sm:px-10 py-10 my-auto">
          {/* Skip */}
          <button
            onClick={close}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-hand"
            aria-label="דלג"
          >
            <X className="h-4 w-4" /> דלג לעבודה
          </button>

          {/* Step chip */}
          <div className="text-center mb-6 mt-4 sm:mt-0">
            <div className="inline-block text-[11px] font-hand tracking-widest uppercase px-3 py-1 rounded-full border border-foreground/20 bg-background/40 backdrop-blur">
              שלב {step.num} · {step.title}
            </div>
          </div>

          {/* Stage tracker — LEARN → SEE → DO, always visible */}
          <div
            className="flex items-center justify-center gap-3 sm:gap-5 mb-8 flex-wrap"
            dir="ltr"
          >
            <StageWord label="LEARN" active={stage === "learn"} />
            <span className="text-foreground/30 text-2xl">→</span>
            <StageWord label="SEE" active={stage === "see"} />
            <span className="text-foreground/30 text-2xl">→</span>
            <StageWord label="DO" active={false} />
          </div>

          {/* Glass body */}
          <div
            key={stage}
            className="lsd-stage-enter relative rounded-3xl bg-foreground/[0.04] backdrop-blur-md border border-foreground/10 p-6 sm:p-10 min-h-[220px] shadow-[0_0_60px_-20px_rgba(255,61,245,0.35)]"
          >
            {loading && !content ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground font-hand">
                <Loader2 className="h-5 w-5 animate-spin" />
                מכין את ה-{stage.toUpperCase()} שלכם...
              </div>
            ) : content ? (
              stage === "learn" ? (
                <Typewriter
                  key={"learn-" + (content.learn?.length ?? 0)}
                  text={content.learn}
                  className="font-hand text-2xl sm:text-3xl leading-relaxed whitespace-pre-line block"
                />
              ) : (
                <div className="space-y-5">
                  <div className="font-hand text-base text-muted-foreground">
                    <span className="font-sketch uppercase text-foreground tracking-wider text-sm mr-2">
                      הסיטואציה:
                    </span>
                    {content.see.context}
                  </div>
                  <Typewriter
                    key={"see-" + (content.see.execution?.length ?? 0)}
                    text={content.see.execution}
                    className="font-hand text-2xl sm:text-3xl leading-relaxed whitespace-pre-line block"
                  />
                </div>
              )
            ) : null}
          </div>

          {/* Footer */}
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
              {stage === "see" && (
                <button
                  onClick={goBack}
                  className="px-4 py-2 rounded-full border border-foreground/20 hover:border-foreground/50 text-sm font-sketch uppercase tracking-wider transition"
                >
                  ← LEARN
                </button>
              )}
              <button
                onClick={goNext}
                className="px-6 py-2.5 rounded-full text-sm font-sketch uppercase tracking-wider text-background relative overflow-hidden group"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg,#ff3df5,#00e5ff,#b6ff3d,#ff7a00,#ff3df5)",
                  backgroundSize: "300% 300%",
                  animation: "gradientPan 6s ease infinite",
                  color: "#0a0a0a",
                  fontWeight: 900,
                }}
              >
                {stage === "learn" ? "Next: SEE →" : "🛠️ Let's DO it →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
