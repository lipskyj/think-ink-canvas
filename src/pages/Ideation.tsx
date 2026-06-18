import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Sparkles, X, Timer, Play, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import LinkedDataBanner from "@/components/LinkedDataBanner";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";

interface Idea {
  text: string;
  starred: boolean;
  method: string;
}

interface IdeationRound {
  id: string;
  title: string;
  emoji: string;
  description: string;
  detailedInstructions: string[];
  example: string;
  placeholders: string[];
  minIdeas: number;
  timerDuration: number; // seconds
}

const ALL_ROUNDS: IdeationRound[] = [
  {
    id: "worst_idea",
    title: "הרעיונות הכי גרועים",
    emoji: "🗑️",
    description: "חשבו על הפתרונות הכי גרועים, מטופשים ובלתי אפשריים. ככל שיותר נורא — יותר טוב! בסוף נהפוך אותם לרעיונות מנצחים.",
    detailedInstructions: [
      "כתבו פתרונות שהם בכוונה נוראיים או מגוחכים",
      "אל תצנזרו את עצמכם — ככל שיותר מוגזם, יותר טוב",
      "בסוף הסבב — סמנו ⭐ על אלה שאפשר להפוך לרעיון טוב",
    ],
    example: "׳לגרום למשתמש לחכות שעתיים לכל פעולה׳ → ההיפך: ׳הכל מיידי בלחיצה אחת׳",
    placeholders: [
      "רעיון גרוע #1 — מה הדבר הכי מטופש?",
      "רעיון גרוע #2 — איך לגרום למשתמש לברוח?",
      "רעיון גרוע #3 — מה יגרום לכולם לשנוא את המוצר?",
      "רעיון גרוע #4 — הפתרון הכי יקר ומסובך...",
      "רעיון גרוע #5 — משהו שאף אחד לא היה רוצה...",
    ],
    minIdeas: 5,
    timerDuration: 180,
  },
  {
    id: "rapid_fire",
    title: "ירי מהיר",
    emoji: "⚡",
    description: "כתבו כמה שיותר רעיונות במהירות. לא חושבים, לא שופטים — פשוט כותבים! בסוף סמנו ⭐ את הזוכים.",
    detailedInstructions: [
      "הפעילו את הטיימר ותתחילו",
      "אסור למחוק! אסור לשפוט! כמות לפני איכות",
      "בסוף — סמנו ⭐ על הרעיונות הכי טובים",
    ],
    example: "פשוט כתבו מילה, משפט, ציור — כל דבר שעולה בראש!",
    placeholders: [
      "רעיון מהיר — לא חושבים, כותבים!",
      "עוד אחד — מהר מהר!",
      "ועוד אחד — לא עוצרים!",
      "ממשיכים — הכל הולך!",
      "עוד רעיון — כמעט סיימתם!",
      "רעיון נוסף — אל תעצרו!",
    ],
    minIdeas: 6,
    timerDuration: 180,
  },
  {
    id: "reverse",
    title: "בונוס: הפוך על הפוך",
    emoji: "🔃",
    description: "סבב אופציונלי. קחו את הרעיונות הגרועים והפכו אותם — או שלבו שני רעיונות מהסבבים הקודמים לרעיון אחד מנצח.",
    detailedInstructions: [
      "חזרו לרעיונות הגרועים — מה ההיפך החכם שלהם?",
      "שלבו בין רעיונות מסבבים שונים",
      "סמנו ⭐ את הרעיונות הסופיים שלכם",
    ],
    example: "רעיון גרוע ׳ממשק בסינית עתיקה׳ → הפוך: ׳ממשק כל כך פשוט שלא צריך שפה — רק אייקונים׳",
    placeholders: [
      "ההיפך של רעיון גרוע = פתרון טוב...",
      "שילוב בין שני רעיונות...",
      "רעיון מנצח שנולד מהתהליך...",
      "שיפור של רעיון קיים...",
    ],
    minIdeas: 4,
    timerDuration: 180,
  },
];


const Ideation = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [allIdeas, setAllIdeas] = useState<Record<string, Idea[]>>({});
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundStarted, setRoundStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ROUNDS = showBonus ? ALL_ROUNDS : ALL_ROUNDS.slice(0, 2);
  const currentRound = ROUNDS[currentRoundIndex] || ROUNDS[0];


  useEffect(() => {
    const saved = getStepData("ideation");
    if (saved?.allIdeas) {
      setAllIdeas(saved.allIdeas);
      // Auto-unlock bonus if it has saved ideas
      const bonusHasIdeas = saved.allIdeas["reverse"]?.some((i: Idea) => i.text.trim());
      if (bonusHasIdeas) setShowBonus(true);
      const rounds = bonusHasIdeas ? ALL_ROUNDS : ALL_ROUNDS.slice(0, 2);
      // Find the furthest completed round
      let lastCompletedIdx = -1;
      rounds.forEach((r, idx) => {
        const ideas = saved.allIdeas[r.id];
        if (ideas && ideas.some((i: Idea) => i.text.trim())) {
          lastCompletedIdx = idx;
        }
      });
      if (lastCompletedIdx >= 0 && lastCompletedIdx < rounds.length - 1) {
        setCurrentRoundIndex(lastCompletedIdx + 1);
      } else if (lastCompletedIdx === rounds.length - 1) {
        setCurrentRoundIndex(rounds.length - 1);
        setRoundStarted(true);
      }
    }
    // Legacy migration
    if (saved?.ideas && !saved?.allIdeas) {
      setAllIdeas({ legacy: saved.ideas });
    }
  }, [getStepData]);


  // Timer
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            setTimerFinished(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timeLeft]);

  const startRound = () => {
    setRoundStarted(true);
    setTimeLeft(currentRound.timerDuration);
    setTimerFinished(false);
    setTimerRunning(true);
    // Initialize ideas for this round if empty
    if (!allIdeas[currentRound.id] || allIdeas[currentRound.id].length === 0) {
      setAllIdeas((prev) => ({
        ...prev,
        [currentRound.id]: Array.from({ length: currentRound.minIdeas }, () => ({
          text: "",
          starred: false,
          method: currentRound.id,
        })),
      }));
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerFinished(false);
    setTimeLeft(currentRound.timerDuration);
  };

  const goToNextRound = () => {
    if (currentRoundIndex < ROUNDS.length - 1) {
      setCurrentRoundIndex((i) => i + 1);
      setRoundStarted(false);
      setTimerRunning(false);
      setTimerFinished(false);
    }
  };

  const goToPrevRound = () => {
    if (currentRoundIndex > 0) {
      setCurrentRoundIndex((i) => i - 1);
      setRoundStarted(true); // Show the previous round's ideas
      setTimerRunning(false);
      setTimerFinished(false);
    }
  };

  const currentIdeas = allIdeas[currentRound.id] || [];

  const addIdea = () => {
    setAllIdeas((prev) => ({
      ...prev,
      [currentRound.id]: [...(prev[currentRound.id] || []), { text: "", starred: false, method: currentRound.id }],
    }));
  };

  const removeIdea = (i: number) => {
    setAllIdeas((prev) => ({
      ...prev,
      [currentRound.id]: (prev[currentRound.id] || []).filter((_, idx) => idx !== i),
    }));
  };

  const updateIdea = (i: number, text: string) => {
    setAllIdeas((prev) => {
      const ideas = [...(prev[currentRound.id] || [])];
      ideas[i] = { ...ideas[i], text };
      return { ...prev, [currentRound.id]: ideas };
    });
  };

  const toggleStar = (i: number) => {
    setAllIdeas((prev) => {
      const ideas = [...(prev[currentRound.id] || [])];
      ideas[i] = { ...ideas[i], starred: !ideas[i].starred };
      return { ...prev, [currentRound.id]: ideas };
    });
  };

  // Flatten all ideas for saving
  const flatIdeas = Object.values(allIdeas).flat();
  const getData = useCallback(() => ({ allIdeas, ideas: flatIdeas }), [allIdeas, flatIdeas]);
  const hasContent = flatIdeas.some((i) => i.text.trim());
  const previousData = getAllPreviousData("ideation");

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerPercent = currentRound ? ((currentRound.timerDuration - timeLeft) / currentRound.timerDuration) * 100 : 0;

  // All starred ideas across all rounds
  const allStarred = Object.entries(allIdeas).flatMap(([roundId, ideas]) =>
    ideas.filter((i) => i.starred && i.text.trim()).map((i) => ({
      ...i,
      roundTitle: ROUNDS.find((r) => r.id === roundId)?.title || roundId,
    }))
  );

  return (
    <StepPage stepKey="ideation" onSave={getData} canComplete={hasContent}>
      <LinkedDataBanner stepKey="ideation" />
      <CoherenceTracker stepKey="ideation" currentData={{ ideas: flatIdeas }} />

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        {ROUNDS.map((round, idx) => {
          const hasIdeas = allIdeas[round.id]?.some((i) => i.text.trim());
          return (
            <button
              key={round.id}
              onClick={() => {
                setCurrentRoundIndex(idx);
                setRoundStarted(hasIdeas || false);
                setTimerRunning(false);
                setTimerFinished(false);
              }}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentRoundIndex
                  ? "bg-foreground"
                  : hasIdeas
                  ? "bg-foreground/40"
                  : "bg-secondary"
              }`}
              title={`${round.emoji} ${round.title}`}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center mb-6">
        סבב {currentRoundIndex + 1} מתוך {ROUNDS.length}
      </p>

      {/* Rules banner */}
      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <div className="flex items-center relative">
          <p className="text-base text-muted-foreground">
            🎯 כללים: דחו שיפוט • הרבו בכמות • בנו על רעיונות של אחרים • היו ויזואליים
          </p>
          <SectionHelper
            stepKey="ideation"
            sectionKey="idea"
            currentData={{ ideas: flatIdeas }}
            previousData={previousData}
            onApply={(v) => {
              setAllIdeas((prev) => ({
                ...prev,
                [currentRound.id]: [...(prev[currentRound.id] || []), { text: v, starred: false, method: currentRound.id }],
              }));
            }}
          />
        </div>
      </div>

      {/* Round intro (before starting) */}
      {!roundStarted ? (
        <div className="sketch-border p-8 mb-6 text-center animate-fade-in">
          <div className="text-6xl mb-4">{currentRound.emoji}</div>
          <h2 className="text-2xl font-bold mb-3">{currentRound.title}</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto">{currentRound.description}</p>

          <div className="sketch-border p-5 mb-6 bg-accent/10 text-right max-w-lg mx-auto">
            <h3 className="font-bold mb-3 text-sm">📋 איך עושים את זה:</h3>
            <ol className="space-y-2">
              {currentRound.detailedInstructions.map((inst, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="font-bold text-foreground min-w-[20px]">{i + 1}.</span>
                  {inst}
                </li>
              ))}
            </ol>
          </div>

          <div className="sketch-border p-4 mb-6 bg-secondary/30 max-w-lg mx-auto text-right">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold">💡 דוגמה: </span>
              {currentRound.example}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <Timer className="h-4 w-4" />
            <span>יש לכם {Math.floor(currentRound.timerDuration / 60)} דקות{currentRound.timerDuration % 60 > 0 ? ` ו-${currentRound.timerDuration % 60} שניות` : ""}</span>
          </div>

          <button onClick={startRound} className="sketch-btn text-lg px-8 py-3 flex items-center gap-2 mx-auto">
            <Play className="h-5 w-5" />
            יאללה, מתחילים!
          </button>

          {currentRoundIndex > 0 && (
            <button onClick={goToPrevRound} className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
              <ChevronRight className="h-4 w-4" /> חזרה לסבב הקודם
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Timer Section */}
          <div className="sketch-border p-5 mb-6 bg-accent/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentRound.emoji}</span>
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  {currentRound.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!timerRunning && timeLeft > 0 && (
                  <button onClick={() => setTimerRunning(true)} className="sketch-btn-outline flex items-center gap-1 text-xs px-3 py-1">
                    <Play className="h-3 w-3" /> המשך
                  </button>
                )}
                {timerRunning && (
                  <button onClick={() => setTimerRunning(false)} className="sketch-btn-outline flex items-center gap-1 text-xs px-3 py-1">
                    ⏸ עצור
                  </button>
                )}
                <button onClick={resetTimer} className="p-1 hover:bg-accent rounded-sm">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timerFinished ? "bg-destructive" : timerPercent > 75 ? "bg-orange-500" : "bg-foreground"
                  }`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              <div className={`text-center font-mono text-3xl font-bold ${timerFinished ? "text-destructive animate-pulse" : ""}`}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              {timerFinished && (
                <p className="text-center text-destructive font-bold mt-1 animate-fade-in">⏰ הזמן נגמר! סמנו את הרעיונות הטובים ביותר ⭐</p>
              )}
            </div>
          </div>

          {/* Instructions reminder */}
          <p className="text-sm text-muted-foreground mb-4 text-right">
            {currentRound.description}
          </p>

          {/* Ideas list */}
          <div className="space-y-3">
            {currentIdeas.map((idea, i) => (
              <div key={i} className="flex items-center gap-2 animate-fade-in">
                <button
                  onClick={() => toggleStar(i)}
                  className={`p-2 rounded-sm transition-colors ${idea.starred ? "bg-foreground text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <input
                  className="sketch-input flex-1"
                  placeholder={currentRound.placeholders[i % currentRound.placeholders.length]}
                  value={idea.text}
                  onChange={(e) => updateIdea(i, e.target.value)}
                />
                {currentIdeas.length > 1 && (
                  <button onClick={() => removeIdea(i)} className="p-1 hover:bg-accent rounded-sm">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addIdea} className="sketch-btn-outline mt-4 flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> הוסף רעיון
          </button>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goToPrevRound}
              disabled={currentRoundIndex === 0}
              className="sketch-btn-outline flex items-center gap-1 text-sm disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" /> סבב קודם
            </button>

            {currentRoundIndex < ROUNDS.length - 1 ? (
              <button onClick={goToNextRound} className="sketch-btn flex items-center gap-2 text-sm">
                לסבב הבא <ChevronLeft className="h-4 w-4" />
              </button>
            ) : !showBonus ? (
              <button
                onClick={() => { setShowBonus(true); setCurrentRoundIndex(2); setRoundStarted(false); }}
                className="sketch-btn-outline flex items-center gap-2 text-sm"
              >
                ✨ סבב בונוס: הפוך על הפוך
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" /> סיימתם את כל הסבבים!
              </div>
            )}
          </div>
        </>
      )}

      {/* All starred ideas summary */}
      {allStarred.length > 0 && (
        <div className="mt-8 sketch-border p-5 animate-fade-in">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">⭐ רעיונות מסומנים מכל הסבבים</h3>
          <ul className="space-y-2">
            {allStarred.map((idea, idx) => (
              <li key={idx} className="text-lg flex items-start gap-2">
                <span>•</span>
                <span>{idea.text}</span>
                <span className="text-xs text-muted-foreground mt-1">({idea.roundTitle})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </StepPage>
  );
};

export default Ideation;
