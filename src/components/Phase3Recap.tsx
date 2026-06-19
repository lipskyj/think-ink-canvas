import { useMemo } from "react";
import { useProject } from "@/contexts/ProjectContext";
import PhaseRecap, { RecapItem } from "./PhaseRecap";

export default function Phase3Recap() {
  const { getStepData } = useProject();

  const items = useMemo<RecapItem[]>(() => {
    const brief = getStepData("prototype_brief") || {};
    const moscow = getStepData("moscow_prioritization") || {};
    const prd = getStepData("prd_generator") || {};
    const persona = getStepData("user_persona") || {};

    const out: RecapItem[] = [];

    if (brief.objective) {
      out.push({ num: 1, title: "מטרת אב-הטיפוס", body: brief.objective });
    }

    const must = (moscow.must || brief.must || "").toString();
    if (must.trim()) {
      const items = must.split(/\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
      out.push({
        num: 2,
        title: "Must — חייב להיות ב-MVP",
        body: items.length > 1 ? (
          <ul className="list-disc pr-5 space-y-1">
            {items.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        ) : must,
      });
    }

    if (brief.successCriteria) {
      out.push({ num: 3, title: "איך נדע שהצלחנו", body: brief.successCriteria });
    }

    if (persona.name) {
      out.push({
        num: 4,
        title: "עבור מי בונים",
        body: (
          <>
            <strong>{persona.name}</strong>
            {persona.occupation ? ` · ${persona.occupation}` : ""}
          </>
        ),
      });
    }

    if (prd.markdown || prd.content) {
      out.push({
        num: 5,
        title: "PRD מוכן",
        body: "מסמך הדרישות נוצר ומוכן להדבקה במערכת text-to-code.",
      });
    }

    return out;
  }, [getStepData]);

  return (
    <PhaseRecap
      storageKey="phase3_recap_dismissed"
      phaseNum={3}
      headline="סיימתם את שלב 3 — פיתוח הפתרון!"
      intro="הגדרתם בריף, MVP ופרומפט. עכשיו הופכים את כל העבודה לסיפור משכנע שאפשר להציג."
      items={items}
      nextHint="עוברים לשלב 4 — הצגת הפתרון. סקריפט, שקפים וויזואלים שיגרמו לקהל להבין למה זה חשוב."
    />
  );
}
