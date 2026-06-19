import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X, Trophy } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

const DISMISS_KEY = "phase1_recap_dismissed";

export default function Phase1Recap() {
  const { getStepData } = useProject();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const recap = useMemo(() => {
    const persona = getStepData("user_persona") || {};
    const empathy = getStepData("empathy_map") || {};
    const whys = (getStepData("five_whys") || {}).whys || [];
    const pov = getStepData("pov_statement") || {};
    const hmw = (getStepData("how_might_we") || {}).questions || [];

    const lastWhy = [...whys].reverse().find((w: string) => w?.trim?.());
    const personaLine = [persona.name, persona.occupation].filter(Boolean).join(" · ");
    const empathySummary =
      empathy.userDesc ||
      empathy.quadrants?.feels ||
      empathy.quadrants?.thinks ||
      "";

    return {
      persona: personaLine,
      personaGoals: persona.goals || "",
      empathy: empathySummary,
      rootCause: lastWhy || "",
      pov,
      hmw: hmw.filter((q: string) => q?.trim?.()),
    };
  }, [getStepData]);

  const hasAny =
    recap.persona || recap.empathy || recap.rootCause || recap.pov.user || recap.hmw.length;

  if (dismissed || !hasAny) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="sketch-border p-5 mb-6 bg-secondary/40 relative animate-fade-in">
      <button
        onClick={dismiss}
        className="absolute top-3 left-3 p-1 hover:bg-accent rounded-sm"
        aria-label="סגור"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-6 w-6" />
        <h2 className="font-sketch text-2xl">סיימתם את שלב 1 — הגדרת הבעיה!</h2>
      </div>
      <p className="font-hand text-base text-muted-foreground mb-4">
        כל מה שעשיתם עד עכשיו עומד מאחורי הרעיונות שתעלו בשלב הבא. הנה תזכורת קצרה:
      </p>

      <div className="space-y-3 text-sm">
        {recap.persona && (
          <RecapRow num={1} title="פרסונה">
            <strong>{recap.persona}</strong>
            {recap.personaGoals ? ` — ${recap.personaGoals}` : ""}
          </RecapRow>
        )}
        {recap.empathy && (
          <RecapRow num={2} title="מפת אמפתיה">
            {recap.empathy}
          </RecapRow>
        )}
        {recap.rootCause && (
          <RecapRow num={3} title="שורש הבעיה (חמישה למה)">
            {recap.rootCause}
          </RecapRow>
        )}
        {(recap.pov.user || recap.pov.need || recap.pov.insight) && (
          <RecapRow num={4} title="POV">
            <strong>{recap.pov.user || "___"}</strong>
            <span className="font-bold text-primary mx-1">צריך</span>
            <strong>{recap.pov.need || "___"}</strong>
            <span className="font-bold text-primary mx-1">כי</span>
            <strong>{recap.pov.insight || "___"}</strong>
          </RecapRow>
        )}
        {recap.hmw.length > 0 && (
          <RecapRow num={5} title="איך נוכל">
            <ul className="list-disc pr-4 space-y-0.5">
              {recap.hmw.slice(0, 3).map((q: string, i: number) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </RecapRow>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-foreground/10">
        <CheckCircle2 className="h-4 w-4 text-foreground/60" />
        <p className="font-hand text-sm text-muted-foreground">
          עכשיו עוברים לשלב 2 — גיבוש הפתרון. תפקידכם להציף הרבה רעיונות בלי לשפוט.
        </p>
      </div>
    </div>
  );
}

function RecapRow({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="stage-number shrink-0 w-7 h-7 text-xs mt-0.5">{num}</span>
      <div className="flex-1">
        <div className="font-sketch text-base">{title}</div>
        <div className="text-foreground/80 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
