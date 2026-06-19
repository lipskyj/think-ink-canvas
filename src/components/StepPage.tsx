import { useNavigate } from "react-router-dom";
import { ExternalLink, CheckCircle, ArrowLeft, ArrowRight, Sparkles, AlertTriangle, ChevronUp, Info, Lock, BookOpen, Home } from "lucide-react";
import Layout from "@/components/Layout";
import { useProject } from "@/contexts/ProjectContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useClass } from "@/contexts/ClassContext";
import { getStepByKey, getPreviousStep, getNextStep, TOTAL_STEPS } from "@/lib/steps";
import AIAssistant from "@/components/AIAssistant";
import StepIntroModal from "@/components/StepIntroModal";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface StepPageProps {
  stepKey: string;
  children: React.ReactNode;
  onSave?: () => any;
  canComplete?: boolean;
}

export default function StepPage({ stepKey, children, onSave, canComplete = true }: StepPageProps) {
  const navigate = useNavigate();
  const { isStepCompleted, saveStepData, completeStep, uncompleteStep, getAllPreviousData, getStepData, getMissingPrerequisites, isLoading } = useProject();
  const { aiEnabled, isStepLocked } = useAdmin();
  const { isClassMode } = useClass();
  const [showAI, setShowAI] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const find = () => setToolbarSlot(document.getElementById("step-toolbar-slot"));
    find();
    const t = setTimeout(find, 0);
    return () => clearTimeout(t);
  }, [stepKey]);
  const locked = isClassMode && isStepLocked(stepKey);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialized = useRef(false);
  const onSaveRef = useRef(onSave);
  const dataLoadedRef = useRef(false);

  // Always keep the latest onSave in the ref
  onSaveRef.current = onSave;

  // Track when data has finished loading (so we don't autosave empty state over DB data)
  useEffect(() => {
    if (!isLoading) {
      // Delay marking as loaded to allow form state to hydrate from loaded data
      const timer = setTimeout(() => { dataLoadedRef.current = true; }, 800);
      return () => clearTimeout(timer);
    } else {
      dataLoadedRef.current = false;
    }
  }, [isLoading]);

  const step = getStepByKey(stepKey);
  const prev = getPreviousStep(stepKey);
  const next = getNextStep(stepKey);
  const completed = isStepCompleted(stepKey);
  const missingSteps = getMissingPrerequisites(stepKey);

  // Autosave: debounce saving on every render (which happens on every keystroke)
  useEffect(() => {
    if (!onSaveRef.current || locked || !step) return;
    // Don't autosave until data has loaded from DB (prevents overwriting with empty state)
    if (!dataLoadedRef.current) return;
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const saveFn = onSaveRef.current;
      if (saveFn) {
        const data = saveFn();
        if (data) {
          await saveStepData(stepKey, data, true);
        }
      }
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }); // No deps — runs every render so any keystroke triggers the debounce

  if (!step) return null;


  const persistCurrentStep = async (silent = false) => {
    const saveFn = onSaveRef.current;
    if (saveFn) {
      const data = saveFn();
      if (data) {
        await saveStepData(stepKey, data, silent);
      }
    }
  };

  const navigateWithSave = async (url: string) => {
    await persistCurrentStep(true);
    navigate(url);
  };

  const handleSave = async () => {
    await persistCurrentStep(false);
  };

  const handleComplete = async () => {
    await persistCurrentStep(true);
    await completeStep(stepKey);
    navigate(next?.url ?? "/");
  };

  const handleUncomplete = async () => {
    await uncompleteStep(stepKey);
  };

  return (
    <Layout>
      <StepIntroModal stepKey={stepKey} />
      <div className="max-w-4xl mx-auto">
        {/* באנר נעילה */}
        {locked && (
          <div className="sketch-border-thin bg-secondary/50 p-3 mb-4 flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="font-hand text-base">
              <strong>שלב נעול</strong> — לא ניתן לערוך או לשמור. פנה למנחה לפתיחה.
            </p>
          </div>
        )}

        {/* אזהרת דרישות קדם חסרות */}
        {!locked && missingSteps.length > 0 && (
          <div className="sketch-border-thin bg-secondary/50 p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <p className="font-hand text-base text-muted-foreground">
              <strong>מומלץ:</strong> שקלו להשלים את{" "}
              {missingSteps.slice(0, 3).join(", ")}
              {missingSteps.length > 3 ? ` ו-${missingSteps.length - 3} נוספים` : ""}{" "}
              קודם — הם מזינים את השלב הזה.
            </p>
          </div>
        )}

        {/* סרגל עליון מאוחד — כל הניווט והפעולות בשורה אחת */}
        <div className="flex items-center gap-2 mb-4 flex-nowrap overflow-x-auto">
          {prev && (
            <button
              onClick={() => navigateWithSave(prev.url)}
              className="sketch-btn-outline text-sm flex items-center justify-center w-9 h-9 p-0 shrink-0"
              aria-label="השלב הקודם"
              title="הקודם"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => navigateWithSave("/")}
            className="sketch-btn-outline text-sm flex items-center justify-center w-9 h-9 p-0 shrink-0"
            aria-label="חזרה למפת השלבים"
            title="מפה"
          >
            <Home className="h-4 w-4" />
          </button>
          {next && (
            <button
              onClick={() => navigateWithSave(next.url)}
              className="sketch-btn-outline text-sm flex items-center justify-center w-9 h-9 p-0 shrink-0"
              aria-label="השלב הבא"
              title="הבא"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <span className="pill-chip pill-chip-coral shrink-0">שלב {String(step.num).padStart(2, "0")}</span>
          <span className="pill-chip pill-chip-outline shrink-0 whitespace-nowrap">{step.num} / {TOTAL_STEPS}</span>
          {completed && <span className="pill-chip pill-chip-mint shrink-0">הושלם</span>}

          <div className="flex-1" />

          <button
            onClick={() => window.dispatchEvent(new CustomEvent("lsd:open", { detail: { stepKey } }))}
            className="sketch-btn-outline text-sm flex items-center gap-1 shrink-0"
            title="הקדמה"
          >
            <BookOpen className="h-3 w-3" /> הקדמה
          </button>
          {aiEnabled && (
            <button
              onClick={() => setShowAI(!showAI)}
              className={`sketch-btn-outline text-sm flex items-center gap-1 shrink-0 ${showAI ? "bg-foreground text-background" : ""}`}
            >
              <Sparkles className="h-3 w-3" /> סייע AI
            </button>
          )}
          <a
            href={step.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sketch-btn-outline text-sm flex items-center gap-1 shrink-0"
          >
            <ExternalLink className="h-3 w-3" /> למד עוד
          </a>
          {!locked && completed && (
            <button onClick={handleUncomplete} className="sketch-btn-outline text-sm flex items-center gap-1 shrink-0">
              פתח מחדש
            </button>
          )}
        </div>

        {/* כותרת */}
        <div className="mb-6">
          <h1 className="display-huge mb-1">{step.title}</h1>
        </div>


        {/* מידע מקדים */}
        {step.description && (
          <div className="mb-6">
            {!showOnboarding && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                aria-label="הצג הקדמת שלב"
                title="מה זה השלב הזה?"
              >
                <Info className="h-4 w-4" />
              </button>
            )}
            {showOnboarding && (
              <div className="sketch-border-thin bg-secondary/30 p-4 relative">
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="absolute top-2 left-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="סגור הקדמה"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-base leading-relaxed mb-2">
                      {step.description}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      למה זה חשוב: <span className="font-normal">{step.whyItMatters}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* פאנל AI */}
        {showAI && (
          <AIAssistant
            stepKey={stepKey}
            stepTitle={step.title}
            currentData={getStepData(stepKey)}
            previousData={getAllPreviousData(stepKey)}
            onClose={() => setShowAI(false)}
          />
        )}

        {/* תוכן */}
        <fieldset disabled={locked} className={locked ? "opacity-60 pointer-events-none" : ""}>
        {children}
        </fieldset>

        {/* CTA תחתון — רק כפתור ההשלמה */}
        {!locked && !completed && canComplete && (
          <div className="mt-8 flex justify-center">
            <button onClick={handleComplete} className="sketch-btn text-sm flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> השלם והמשך
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
