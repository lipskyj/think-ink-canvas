import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GripVertical, Plus, X, Star, Trophy, ChevronDown } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import LinkedDataBanner from "@/components/LinkedDataBanner";
import CoherenceTracker from "@/components/CoherenceTracker";

interface MatrixIdea {
  id: string;
  text: string;
  x: number; // 0-100, effort (left=low, right=high)
  y: number; // 0-100, impact (bottom=low, top=high)
  placed: boolean;
  // Simple mode answers (1=easy/low, 2=medium, 3=hard/high)
  hours?: 1 | 3 | 6;
  wow?: 1 | 2 | 3;
  canBuild?: 1 | 2 | 3;
}

const QUADRANT_LABELS = [
  { label: "🏆 ניצחון מהיר", desc: "השפעה גבוהה, מאמץ נמוך", x: 15, y: 15 },
  { label: "📈 פרויקט גדול", desc: "השפעה גבוהה, מאמץ גבוה", x: 85, y: 15 },
  { label: "🤷 מילוי זמן", desc: "השפעה נמוכה, מאמץ נמוך", x: 15, y: 85 },
  { label: "🚫 בזבוז", desc: "השפעה נמוכה, מאמץ גבוה", x: 85, y: 85 },
];

let idCounter = 0;
const genId = () => `idea-${Date.now()}-${idCounter++}`;

const EffortImpact = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [ideas, setIdeas] = useState<MatrixIdea[]>([]);
  const [newIdeaText, setNewIdeaText] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load saved data or import from ideation
  useEffect(() => {
    const saved = getStepData("effort_impact");
    if (saved?.ideas) {
      setIdeas(saved.ideas);
      return;
    }
    // Auto-import starred ideas from ideation
    const ideationData = getStepData("ideation");
    if (ideationData?.ideas) {
      const starred = ideationData.ideas.filter((i: any) => i.starred && i.text?.trim());
      if (starred.length > 0) {
        setIdeas(starred.map((i: any) => ({
          id: genId(),
          text: i.text,
          x: 50,
          y: 50,
          placed: false,
        })));
        return;
      }
      // If no starred, take all non-empty
      const all = ideationData.ideas.filter((i: any) => i.text?.trim());
      if (all.length > 0) {
        setIdeas(all.map((i: any) => ({
          id: genId(),
          text: i.text,
          x: 50,
          y: 50,
          placed: false,
        })));
      }
    }
  }, [getStepData]);

  const addIdea = () => {
    if (!newIdeaText.trim()) return;
    setIdeas((prev) => [...prev, { id: genId(), text: newIdeaText.trim(), x: 50, y: 50, placed: false }]);
    setNewIdeaText("");
  };

  const removeIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  // Drag handlers for mouse
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const rect = matrixRef.current?.getBoundingClientRect();
    if (!rect) return;
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const ideaPixelX = (idea.x / 100) * rect.width;
    const ideaPixelY = (idea.y / 100) * rect.height;
    dragOffset.current = {
      x: e.clientX - rect.left - ideaPixelX,
      y: e.clientY - rect.top - ideaPixelY,
    };
    setDraggingId(id);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId || !matrixRef.current) return;
      const rect = matrixRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100));
      setIdeas((prev) =>
        prev.map((i) => (i.id === draggingId ? { ...i, x, y, placed: true } : i))
      );
    },
    [draggingId]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    const touch = e.touches[0];
    const rect = matrixRef.current?.getBoundingClientRect();
    if (!rect) return;
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const ideaPixelX = (idea.x / 100) * rect.width;
    const ideaPixelY = (idea.y / 100) * rect.height;
    dragOffset.current = {
      x: touch.clientX - rect.left - ideaPixelX,
      y: touch.clientY - rect.top - ideaPixelY,
    };
    setDraggingId(id);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!draggingId || !matrixRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = matrixRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left - dragOffset.current.x) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top - dragOffset.current.y) / rect.height) * 100));
      setIdeas((prev) =>
        prev.map((i) => (i.id === draggingId ? { ...i, x, y, placed: true } : i))
      );
    },
    [draggingId]
  );

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp, handleTouchMove]);

  const getData = useCallback(() => ({ ideas }), [ideas]);
  const hasContent = ideas.some((i) => i.placed);
  const previousData = getAllPreviousData("effort_impact");

  // Categorize ideas into quadrants
  const quickWins = ideas.filter((i) => i.placed && i.x < 50 && i.y < 50);
  const bigProjects = ideas.filter((i) => i.placed && i.x >= 50 && i.y < 50);
  const fillers = ideas.filter((i) => i.placed && i.x < 50 && i.y >= 50);
  const wastes = ideas.filter((i) => i.placed && i.x >= 50 && i.y >= 50);
  const unplaced = ideas.filter((i) => !i.placed);

  return (
    <StepPage stepKey="effort_impact" onSave={getData} canComplete={hasContent}>
      <LinkedDataBanner stepKey="effort_impact" />
      <CoherenceTracker stepKey="effort_impact" currentData={{ ideas }} />

      {/* Instructions + mode toggle */}
      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold mb-2"> מה לבנות עכשיו?</h3>
            {!advancedMode ? (
              <p className="text-sm text-muted-foreground">
                ענו על 3 שאלות מהירות לכל רעיון. הרעיון הכי "בנו את זה" יוקפץ למעלה.
              </p>
            ) : (
              <ol className="space-y-1 text-sm text-muted-foreground">
                <li>1. גררו כל רעיון למקום על הגרף</li>
                <li>2. ציר X = מאמץ (שמאל=קל) · ציר Y = השפעה (למעלה=מעט)</li>
                <li>3. 🏆 ניצחונות מהירים = למעלה-שמאל — לבנות קודם!</li>
              </ol>
            )}
          </div>
          <button
            onClick={() => setAdvancedMode((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground sketch-border-thin px-2 py-1 whitespace-nowrap"
            type="button"
          >
            {advancedMode ? "מצב פשוט" : "מצב מתקדם (מטריצה)"}
          </button>
        </div>
      </div>


      {/* Add new idea */}
      <div className="flex items-center gap-2 mb-4">
        <input
          className="sketch-input flex-1"
          placeholder="הוסיפו רעיון נוסף..."
          value={newIdeaText}
          onChange={(e) => setNewIdeaText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addIdea()}
        />
        <button onClick={addIdea} className="sketch-btn-outline flex items-center gap-1 text-sm px-3 py-2">
          <Plus className="h-4 w-4" /> הוסף
        </button>
      </div>

      {/* Simple Mode — 3-question scoring */}
      {!advancedMode && (
        <SimpleScoringMode ideas={ideas} setIdeas={setIdeas} />
      )}

      {/* Unplaced ideas (advanced mode only) */}
      {advancedMode && unplaced.length > 0 && (
        <div className="sketch-border p-4 mb-4 bg-accent/10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-bold">
            ✋ רעיונות שעדיין לא מוקמו — גררו אותם לגרף
          </p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((idea) => (
              <div
                key={idea.id}
                className="sketch-border px-3 py-1.5 text-sm bg-background cursor-grab active:cursor-grabbing flex items-center gap-1.5 select-none"
                onMouseDown={(e) => handleMouseDown(e, idea.id)}
                onTouchStart={(e) => handleTouchStart(e, idea.id)}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[200px] truncate">{idea.text}</span>
                <button onClick={() => removeIdea(idea.id)} className="p-0.5 hover:bg-accent rounded-sm">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrix (advanced mode) */}
      {advancedMode && (<>
      {/* Matrix */}
      <div className="sketch-border p-2 mb-6">
        {/* Y-axis label */}
        <div className="flex items-stretch">
          <div className="flex items-center justify-center w-8 shrink-0">
            <span
              className="text-xs font-bold text-muted-foreground"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              השפעה ←
            </span>
          </div>

          <div className="flex-1">
            <div
              ref={matrixRef}
              className="relative w-full bg-secondary/30 border-2 border-foreground/20 select-none touch-none"
              style={{ aspectRatio: "1 / 1", maxHeight: "500px" }}
            >
              {/* Quadrant lines */}
              <div className="absolute left-1/2 top-0 bottom-0 border-r border-dashed border-foreground/20" />
              <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-foreground/20" />

              {/* Quadrant labels */}
              {QUADRANT_LABELS.map((q, i) => (
                <div
                  key={i}
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: `${q.x}%`,
                    top: `${q.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="text-lg">{q.label.split(" ")[0]}</div>
                  <div className="text-xs font-bold text-muted-foreground">{q.label.split(" ").slice(1).join(" ")}</div>
                  <div className="text-[10px] text-muted-foreground/60">{q.desc}</div>
                </div>
              ))}

              {/* Placed ideas */}
              {ideas
                .filter((i) => i.placed)
                .map((idea) => (
                  <div
                    key={idea.id}
                    className={`absolute z-10 sketch-border px-2 py-1 text-xs bg-background shadow-md cursor-grab active:cursor-grabbing select-none flex items-center gap-1 ${
                      draggingId === idea.id ? "ring-2 ring-foreground scale-105" : ""
                    } ${idea.x < 50 && idea.y < 50 ? "border-foreground/60 font-bold" : ""}`}
                    style={{
                      left: `${idea.x}%`,
                      top: `${idea.y}%`,
                      transform: "translate(-50%, -50%)",
                      maxWidth: "140px",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, idea.id)}
                    onTouchStart={(e) => handleTouchStart(e, idea.id)}
                  >
                    {idea.x < 50 && idea.y < 50 && <Star className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{idea.text}</span>
                  </div>
                ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-1">
              <span className="text-xs font-bold text-muted-foreground">מאמץ →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary by quadrant */}
      {hasContent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">


          {[
            { title: "🏆 ניצחונות מהירים", items: quickWins, highlight: true },
            { title: "📈 פרויקטים גדולים", items: bigProjects, highlight: false },
            { title: "🤷 מילוי זמן", items: fillers, highlight: false },
            { title: "🚫 לא שווה", items: wastes, highlight: false },
          ].map((quad) =>
            quad.items.length > 0 ? (
              <div
                key={quad.title}
                className={`sketch-border p-4 ${quad.highlight ? "bg-accent/20 border-foreground/40" : "bg-secondary/10"}`}
              >
                <h4 className="font-bold text-sm mb-2">{quad.title}</h4>
                <ul className="space-y-1">
                  {quad.items.map((i) => (
                    <li key={i.id} className="text-sm flex items-center gap-1">
                      <span>•</span> {i.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
      </>)}
    </StepPage>
  );
};

// ── Simple Mode: 3 quick questions per idea, auto-rank ───────────────
const HOURS_OPTS = [
  { v: 1, label: "1 שעה" },
  { v: 3, label: "3 שעות" },
  { v: 6, label: "6+ שעות" },
] as const;
const WOW_OPTS = [
  { v: 1, label: "קצת" },
  { v: 2, label: "הרבה" },
  { v: 3, label: "וואו" },
] as const;
const CAN_OPTS = [
  { v: 3, label: "כן" },
  { v: 2, label: "חצי" },
  { v: 1, label: "לא" },
] as const;

interface SimpleProps {
  ideas: MatrixIdea[];
  setIdeas: React.Dispatch<React.SetStateAction<MatrixIdea[]>>;
}

const SimpleScoringMode = ({ ideas, setIdeas }: SimpleProps) => {
  const setField = (id: string, field: "hours" | "wow" | "canBuild", value: number) => {
    setIdeas((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, [field]: value as any, placed: true, x: 100 - value * 30, y: 100 - value * 30 } : it,
      ),
    );
  };

  // Score: higher = better. wow + canBuild - hours/2. Only ideas with all 3 answered are scored.
  const scored = ideas
    .map((it) => {
      const complete = it.hours != null && it.wow != null && it.canBuild != null;
      const score = complete ? (it.wow! + it.canBuild!) * 2 - it.hours! : -Infinity;
      return { ...it, _score: score, _complete: complete };
    })
    .sort((a, b) => b._score - a._score);

  const winner = scored.find((s) => s._complete);
  const rest = scored.filter((s) => s !== winner);

  if (ideas.length === 0) {
    return (
      <div className="sketch-border p-6 mb-4 bg-secondary/10 text-center">
        <p className="font-hand text-base text-muted-foreground">
          אין רעיונות עדיין. חזרו לשלב <strong>סופת רעיונות</strong>, סמנו ❤️ על הרעיונות שאתם אוהבים, וחזרו לכאן.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {winner && winner._complete && (
        <div className="sketch-border p-5 bg-foreground text-background animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={20} />
            <span className="font-sketch text-lg">המנצח — בנו את זה!</span>
          </div>
          <p className="font-hand text-2xl mt-1">{winner.text}</p>
        </div>
      )}

      {rest.map((idea) => (
        <div key={idea.id} className="sketch-card p-4">
          <p className="font-sketch text-base mb-3">{idea.text}</p>
          <div className="grid md:grid-cols-3 gap-3">
            <ScoreRow
              label="⏱️ כמה שעות לדמו?"
              options={HOURS_OPTS as any}
              value={idea.hours}
              onChange={(v) => setField(idea.id, "hours", v)}
            />
            <ScoreRow
              label="🤯 כמה זה ירגש?"
              options={WOW_OPTS as any}
              value={idea.wow}
              onChange={(v) => setField(idea.id, "wow", v)}
            />
            <ScoreRow
              label="🛠️ יודעים לבנות?"
              options={CAN_OPTS as any}
              value={idea.canBuild}
              onChange={(v) => setField(idea.id, "canBuild", v)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ScoreRow = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { v: number; label: string }[];
  value: number | undefined;
  onChange: (v: number) => void;
}) => (
  <div>
    <div className="font-hand text-xs text-muted-foreground mb-1">{label}</div>
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.v}
          onClick={() => onChange(opt.v)}
          type="button"
          className={`flex-1 sketch-border-thin py-1.5 text-xs font-hand ${
            value === opt.v ? "bg-foreground text-background" : "bg-background hover:bg-secondary/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default EffortImpact;

