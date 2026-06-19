import { useMemo } from "react";
import { useProject } from "@/contexts/ProjectContext";
import PhaseRecap, { RecapItem } from "./PhaseRecap";

export default function Phase2Recap() {
  const { getStepData } = useProject();

  const items = useMemo<RecapItem[]>(() => {
    const ideation = getStepData("ideation") || {};
    const matrix = getStepData("effort_impact") || {};
    const pov = getStepData("pov_statement") || {};
    const hmw = (getStepData("how_might_we") || {}).questions || [];

    // gather all ideas across rounds
    const rounds = ideation.rounds || ideation.allIdeas || {};
    let allIdeas: any[] = [];
    if (Array.isArray(ideation.ideas)) allIdeas = ideation.ideas;
    else
      Object.values(rounds).forEach((arr: any) => {
        if (Array.isArray(arr)) allIdeas.push(...arr);
      });
    const ideaCount = allIdeas.filter((i: any) => (i?.text || i)?.toString().trim()).length;
    const starred = allIdeas.filter((i: any) => i?.starred);

    // top-right (high impact, low effort) — quick wins
    const placed = matrix.ideas || matrix.placed || [];
    const quickWins = placed.filter((p: any) => (p.impact ?? 0) >= 0.6 && (p.effort ?? 1) <= 0.4);
    const topPicks = (quickWins.length ? quickWins : placed)
      .slice(0, 3)
      .map((p: any) => p.text || p.label || p.title)
      .filter(Boolean);

    const out: RecapItem[] = [];

    if (pov.user || pov.need) {
      out.push({
        num: 1,
        title: "תזכורת POV",
        body: (
          <>
            <strong>{pov.user || "___"}</strong>
            <span className="font-bold text-primary mx-1">צריך</span>
            <strong>{pov.need || "___"}</strong>
          </>
        ),
      });
    }

    if (hmw.filter((q: string) => q?.trim?.()).length) {
      out.push({
        num: 2,
        title: "שאלת ״איך נוכל״ מנחה",
        body: hmw.find((q: string) => q?.trim?.()),
      });
    }

    if (ideaCount > 0) {
      out.push({
        num: 3,
        title: "סיעור מוחות",
        body: (
          <>
            יצרתם <strong>{ideaCount} רעיונות</strong>
            {starred.length ? <> · סימנתם {starred.length} מועדפים</> : null}
          </>
        ),
      });
    }

    if (topPicks.length) {
      out.push({
        num: 4,
        title: quickWins.length ? "ניצחונות מהירים (השפעה גבוהה, מאמץ נמוך)" : "כיוונים מובילים",
        body: (
          <ul className="list-disc pr-5 space-y-1">
            {topPicks.map((t: string, i: number) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ),
      });
    }

    return out;
  }, [getStepData]);

  return (
    <PhaseRecap
      storageKey="phase2_recap_dismissed"
      phaseNum={2}
      headline="סיימתם את שלב 2 — גיבוש הפתרון!"
      intro="הצפתם רעיונות ותעדפתם אותם. עכשיו ממקדים את הכיוון לכדי משהו שאפשר באמת לבנות."
      items={items}
      nextHint="עוברים לשלב 3 — פיתוח הפתרון. כותבים בריף, מגדירים MVP, ויוצרים פרומפט לקוד."
    />
  );
}
