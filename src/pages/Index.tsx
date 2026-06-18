import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProject } from "@/contexts/ProjectContext";
import { STEPS, PHASES, type ProcessPhase } from "@/lib/steps";
import { Check, Loader2 } from "lucide-react";

const PHASE_COLORS: Record<ProcessPhase, string> = {
  problem: "hsl(0, 70%, 55%)",
  solution: "hsl(40, 85%, 55%)",
  development: "hsl(145, 55%, 42%)",
};

const Index = () => {
  const { isStepCompleted, isLoading } = useProject();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-sketch mb-3">
            חשיבה עיצובית<br />
            <span className="doodle-underline">ערכת כלים</span> ✏️
          </h1>
          <p className="font-hand text-2xl text-muted-foreground">
            תהליך מובנה ממפת אמפתיה ועד רעיונות.
          </p>
        </div>

        <div className="space-y-8">
          {PHASES.map((phase) => {
            const phaseSteps = STEPS.filter((s) => s.phase === phase.key);
            const completedCount = phaseSteps.filter((s) => isStepCompleted(s.key)).length;
            return (
              <div key={phase.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PHASE_COLORS[phase.key] }}
                  />
                  <h2 className="font-sketch text-xl">{phase.emoji} {phase.title}</h2>
                  <span className="text-xs text-muted-foreground font-hand ml-auto">
                    {completedCount}/{phaseSteps.length}
                  </span>
                </div>
                {phase.key === "problem" && (
                  <p className="text-xs text-muted-foreground font-hand mb-2 mr-5">
                    ↕ חקרו בכל סדר — לא חייבים ללכת לפי הסדר
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {phaseSteps.map((step) => {
                    const completed = isStepCompleted(step.key);
                    const Icon = step.icon;
                    return (
                      <Link
                        key={step.key}
                        to={step.url}
                        className="sketch-card p-4 flex flex-col items-center text-center gap-2 hover:bg-secondary/50 transition-colors group relative"
                      >
                        {completed && (
                          <div
                            className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: PHASE_COLORS[step.phase], color: "white" }}
                          >
                            <Check size={12} />
                          </div>
                        )}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors"
                          style={{
                            borderColor: completed ? PHASE_COLORS[step.phase] : "hsl(var(--border))",
                          }}
                        >
                          <Icon size={20} className="text-foreground" strokeWidth={1.5} />
                        </div>
                        <span className="font-sketch text-xs leading-tight">{step.num}. {step.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 sketch-border-thin p-4 bg-secondary/30">
          <p className="font-hand text-lg text-center text-muted-foreground">
            💡 טיפ: לחצו על כל שלב כדי להתחיל. ניתן לעבוד בכל סדר שתרצו.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
