import { useMemo } from "react";
import { useProject } from "@/contexts/ProjectContext";
import PhaseRecap, { RecapItem } from "./PhaseRecap";

export default function Phase1Recap() {
  const { getStepData } = useProject();

  const items = useMemo<RecapItem[]>(() => {
    const persona = getStepData("user_persona") || {};
    const empathy = getStepData("empathy_map") || {};
    const whys = (getStepData("five_whys") || {}).whys || [];
    const pov = getStepData("pov_statement") || {};
    const hmw = (getStepData("how_might_we") || {}).questions || [];

    const lastWhy = [...whys].reverse().find((w: string) => w?.trim?.());
    const personaLine = [persona.name, persona.occupation].filter(Boolean).join(" · ");
    const empathySummary =
      empathy.userDesc || empathy.quadrants?.feels || empathy.quadrants?.thinks || "";

    const out: RecapItem[] = [];
    if (personaLine)
      out.push({
        num: 1,
        title: "פרסונה",
        body: (
          <>
            <strong>{personaLine}</strong>
            {persona.goals ? ` — ${persona.goals}` : ""}
          </>
        ),
      });
    if (empathySummary)
      out.push({ num: 2, title: "מפת אמפתיה", body: empathySummary });
    if (lastWhy)
      out.push({ num: 3, title: "שורש הבעיה (חמישה למה)", body: lastWhy });
    if (pov.user || pov.need || pov.insight)
      out.push({
        num: 4,
        title: "POV",
        body: (
          <>
            <strong>{pov.user || "___"}</strong>
            <span className="font-bold text-primary mx-1">צריך</span>
            <strong>{pov.need || "___"}</strong>
            <span className="font-bold text-primary mx-1">כי</span>
            <strong>{pov.insight || "___"}</strong>
          </>
        ),
      });
    const cleanHmw = hmw.filter((q: string) => q?.trim?.());
    if (cleanHmw.length)
      out.push({
        num: 5,
        title: "איך נוכל",
        body: (
          <ul className="list-disc pr-5 space-y-1">
            {cleanHmw.slice(0, 3).map((q: string, i: number) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        ),
      });
    return out;
  }, [getStepData]);

  return (
    <PhaseRecap
      storageKey="phase1_recap_dismissed"
      phaseNum={1}
      headline="סיימתם את פאזה 1 — הבנת המשתמש והגדרת הבעיה!"
      intro="לפני שעוברים ליצירת רעיונות, הנה תזכורת של מה שגיליתם:"
      items={items}
      nextHint="עכשיו עוברים לשלב 2 — גיבוש הפתרון. תפקידכם להציף הרבה רעיונות בלי לשפוט."
    />
  );
}
