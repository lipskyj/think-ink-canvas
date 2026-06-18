/**
 * Defines how data flows between steps.
 * Each mapping describes: source step → target step field, with an extractor function.
 */

export interface DataLink {
  sourceStep: string;
  targetStep: string;
  targetField: string;
  label: string;
  extract: (sourceData: any) => string | undefined;
}

export const DATA_LINKS: DataLink[] = [
  // ── Empathy Map → Persona ──
  {
    sourceStep: "empathy_map",
    targetStep: "user_persona",
    targetField: "name",
    label: "תיאור משתמש → שם פרסונה",
    extract: (d) => {
      const desc = d?.userDesc?.trim();
      if (!desc) return undefined;
      // Extract first meaningful name/phrase (before comma, dash, or "who/that")
      const match = desc.match(/^([^,\-–—\n]+)/);
      return match ? match[1].trim() : desc.split(" ").slice(0, 2).join(" ");
    },
  },
  {
    sourceStep: "empathy_map",
    targetStep: "user_persona",
    targetField: "bio",
    label: "תיאור משתמש → ביוגרפיה",
    extract: (d) => d?.userDesc,
  },
  {
    sourceStep: "empathy_map",
    targetStep: "user_persona",
    targetField: "frustrations",
    label: "מרגיש → תסכולים",
    extract: (d) => d?.quadrants?.feels,
  },
  {
    sourceStep: "empathy_map",
    targetStep: "user_persona",
    targetField: "goals",
    label: "עושה → מטרות",
    extract: (d) => d?.quadrants?.does,
  },
  {
    sourceStep: "empathy_map",
    targetStep: "user_persona",
    targetField: "motivations",
    label: "חושב → מוטיבציות",
    extract: (d) => d?.quadrants?.thinks,
  },
  {
    sourceStep: "empathy_map",
    targetStep: "user_persona",
    targetField: "quote",
    label: "אומר → ציטוט",
    extract: (d) => d?.quadrants?.says,
  },

  // ── Empathy Map → POV ──
  {
    sourceStep: "empathy_map",
    targetStep: "pov_statement",
    targetField: "user",
    label: "תיאור משתמש → משתמש POV",
    extract: (d) => d?.userDesc,
  },

  // ── Persona → POV ──
  {
    sourceStep: "user_persona",
    targetStep: "pov_statement",
    targetField: "user",
    label: "שם פרסונה → משתמש POV",
    extract: (d) => {
      if (!d?.name) return undefined;
      return `${d.name}${d.occupation ? `, ${d.occupation}` : ""}`;
    },
  },
  {
    sourceStep: "user_persona",
    targetStep: "pov_statement",
    targetField: "insight",
    label: "תסכולי פרסונה → תובנת POV",
    extract: (d) => d?.frustrations,
  },
  {
    sourceStep: "user_persona",
    targetStep: "pov_statement",
    targetField: "need",
    label: "מטרות פרסונה → צורך POV",
    extract: (d) => d?.goals,
  },

  // ── Converge → POV ──
  {
    sourceStep: "converge",
    targetStep: "pov_statement",
    targetField: "insight",
    label: "תובנת Converge → תובנת POV",
    extract: (d) => {
      const ins = d?.insights?.[0];
      if (!ins?.because) return undefined;
      return ins.because;
    },
  },

  // ── Persona → JTBD ──
  {
    sourceStep: "user_persona",
    targetStep: "jtbd",
    targetField: "_personaContext",
    label: "פרסונה → הקשר JTBD",
    extract: (d) => {
      if (!d?.name) return undefined;
      return `${d.name}: ${d.goals || ""}`;
    },
  },
  {
    sourceStep: "user_persona",
    targetStep: "jtbd",
    targetField: "mainJob",
    label: "מטרות פרסונה → משימה עיקרית",
    extract: (d) => d?.goals,
  },
  {
    sourceStep: "user_persona",
    targetStep: "jtbd",
    targetField: "constraints",
    label: "תסכולי פרסונה → אילוצים",
    extract: (d) => d?.frustrations,
  },

  // ── Affinity Diagram → Converge clusters ──
  {
    sourceStep: "affinity_diagram",
    targetStep: "converge",
    targetField: "_affinityContext",
    label: "אשכולות זיקה → הקשר סינתזה",
    extract: (d) => {
      const cls = d?.clusters?.filter((c: any) => c.label?.trim());
      if (!cls?.length) return undefined;
      return cls.map((c: any) => c.label).join(", ");
    },
  },

  // ── Persona → Journey Map persona name ──
  {
    sourceStep: "user_persona",
    targetStep: "journey_map",
    targetField: "_personaContext",
    label: "פרסונה → הקשר מסע",
    extract: (d) => {
      if (!d?.name) return undefined;
      return `${d.name}${d.occupation ? `, ${d.occupation}` : ""}`;
    },
  },
  {
    sourceStep: "user_persona",
    targetStep: "journey_map",
    targetField: "scenario",
    label: "פרסונה → תרחיש מסע",
    extract: (d) => {
      if (!d?.name) return undefined;
      const parts = [d.name];
      if (d.occupation) parts.push(d.occupation);
      if (d.goals) parts.push(`מנסה ${d.goals}`);
      return parts.join(", ");
    },
  },

  // ── POV → HMW ──
  {
    sourceStep: "pov_statement",
    targetStep: "how_might_we",
    targetField: "_povContext",
    label: "הצהרת POV → הקשר אנ״ע",
    extract: (d) => {
      if (!d?.user || !d?.need) return undefined;
      return `${d.user} צריך ${d.need} כי ${d.insight || "..."}`;
    },
  },

  // ── Converge HMWs → HMW questions ──
  {
    sourceStep: "converge",
    targetStep: "how_might_we",
    targetField: "questions",
    label: "אנ״ע מ-Converge → שאלות אנ״ע",
    extract: (d) => {
      const hmws = d?.hmws?.filter((h: string) => h?.trim());
      if (!hmws?.length) return undefined;
      return JSON.stringify(hmws);
    },
  },

  // ── POV → Five Whys ──
  {
    sourceStep: "pov_statement",
    targetStep: "five_whys",
    targetField: "problem",
    label: "הצהרת POV → בעיה",
    extract: (d) => {
      if (!d?.user || !d?.need) return undefined;
      return `${d.user} צריך ${d.need} כי ${d.insight || "..."}`;
    },
  },

  // ── Journey Map pain points → Five Whys ──
  {
    sourceStep: "journey_map",
    targetStep: "five_whys",
    targetField: "problem",
    label: "נקודת כאב ממפת מסע → בעיה",
    extract: (d) => {
      const stages = d?.stages;
      if (!stages?.length) return undefined;
      // Find the stage with the lowest mood (biggest pain point)
      let worst: any = null;
      for (const s of stages) {
        if (s.painPoints?.trim() && (worst === null || (s.mood ?? 5) < (worst.mood ?? 5))) {
          worst = s;
        }
      }
      return worst?.painPoints;
    },
  },

  // ── Five Whys root cause → Ideation ──
  {
    sourceStep: "five_whys",
    targetStep: "ideation",
    targetField: "_rootCause",
    label: "שורש הבעיה → הקשר סיעור מוחות",
    extract: (d) => {
      const whys = d?.whys;
      if (!whys) return undefined;
      for (let i = whys.length - 1; i >= 0; i--) {
        if (whys[i]?.trim()) return whys[i];
      }
      return undefined;
    },
  },

  // ── Five Whys root cause → HMW ──
  {
    sourceStep: "five_whys",
    targetStep: "how_might_we",
    targetField: "_rootCause",
    label: "שורש הבעיה → הקשר אנ״ע",
    extract: (d) => {
      const whys = d?.whys;
      if (!whys) return undefined;
      for (let i = whys.length - 1; i >= 0; i--) {
        if (whys[i]?.trim()) return `איך נוכל לטפל בכך ש: ${whys[i]}`;
      }
      return undefined;
    },
  },

  // ── HMW → Ideation ──
  {
    sourceStep: "how_might_we",
    targetStep: "ideation",
    targetField: "_hmwContext",
    label: "שאלות אנ״ע → הקשר סיעור מוחות",
    extract: (d) => {
      const qs = d?.questions?.filter((q: string) => q?.trim());
      if (!qs?.length) return undefined;
      return qs.join(" | ");
    },
  },

  // ── POV → Storyboard (context for frames) ──
  {
    sourceStep: "pov_statement",
    targetStep: "storyboard",
    targetField: "_povContext",
    label: "הצהרת POV → הקשר סטוריבורד",
    extract: (d) => {
      if (!d?.user || !d?.need) return undefined;
      return `${d.user} צריך ${d.need}`;
    },
  },

  // ── Persona → Storyboard protagonist ──
  {
    sourceStep: "user_persona",
    targetStep: "storyboard",
    targetField: "protagonist",
    label: "שם פרסונה → גיבור הסטוריבורד",
    extract: (d) => {
      if (!d?.name) return undefined;
      return `${d.name}${d.occupation ? `, ${d.occupation}` : ""}`;
    },
  },

  // ── Persona → Storyboard (context) ──
  {
    sourceStep: "user_persona",
    targetStep: "storyboard",
    targetField: "_personaContext",
    label: "פרסונה → הקשר סטוריבורד",
    extract: (d) => {
      if (!d?.name) return undefined;
      return `${d.name}${d.occupation ? `, ${d.occupation}` : ""}`;
    },
  },

  // ── Ideation starred → Effort Impact ──
  {
    sourceStep: "ideation",
    targetStep: "effort_impact",
    targetField: "_ideasContext",
    label: "רעיונות מסומנים → מטריצת מאמץ-השפעה",
    extract: (d) => {
      const starred = d?.ideas?.filter((i: any) => i.starred && i.text?.trim());
      if (!starred?.length) return undefined;
      return starred.map((i: any) => i.text).join(" | ");
    },
  },

  // ── Effort Impact quick wins → Prototype Brief key features ──
  {
    sourceStep: "effort_impact",
    targetStep: "prototype_brief",
    targetField: "keyFeatures",
    label: "ניצחונות מהירים → תכונות מרכזיות",
    extract: (d) => {
      const wins = d?.ideas?.filter((i: any) => i.placed && i.x < 50 && i.y < 50 && i.text?.trim());
      if (!wins?.length) return undefined;
      return wins.map((i: any) => `• ${i.text}`).join("\n");
    },
  },

  // ── Ideation starred → Prototype Brief key features ──
  {
    sourceStep: "ideation",
    targetStep: "prototype_brief",
    targetField: "keyFeatures",
    label: "רעיונות מסומנים → תכונות מרכזיות",
    extract: (d) => {
      const starred = d?.ideas?.filter((i: any) => i.starred && i.text?.trim());
      if (!starred?.length) return undefined;
      return starred.map((i: any) => `• ${i.text}`).join("\n");
    },
  },

  // ── POV → Prototype Brief objective ──
  {
    sourceStep: "pov_statement",
    targetStep: "prototype_brief",
    targetField: "objective",
    label: "הצהרת POV → מטרת אב-טיפוס",
    extract: (d) => {
      if (!d?.user || !d?.need) return undefined;
      return `לאמת ש-${d.user} יכול ${d.need}`;
    },
  },

  // ── HMW → Prototype Brief objective ──
  {
    sourceStep: "how_might_we",
    targetStep: "prototype_brief",
    targetField: "objective",
    label: "שאלות אנ״ע → מטרת אב-טיפוס",
    extract: (d) => {
      const qs = d?.questions?.filter((q: string) => q?.trim());
      if (!qs?.length) return undefined;
      return `לענות על: ${qs[0]}`;
    },
  },

  // ── Converge insights → Assumption Selection ──
  {
    sourceStep: "converge",
    targetStep: "assumption_selection",
    targetField: "assumptions_text",
    label: "תובנות סינתזה → הנחות",
    extract: (d) => {
      const insights = d?.insights?.filter((ins: any) => ins.because?.trim());
      if (!insights?.length) return undefined;
      return insights.map((ins: any) => ins.because).join("\n");
    },
  },

  // ── Assumption Selection → Prototype Brief assumptions ──
  {
    sourceStep: "assumption_selection",
    targetStep: "prototype_brief",
    targetField: "assumptions",
    label: "הנחות מסוכנות → הנחות לבדיקה",
    extract: (d) => {
      const riskiest = d?.assumptions?.filter((a: any) => a.isRiskiest && a.text?.trim());
      if (!riskiest?.length) return undefined;
      return riskiest.map((a: any) => `• ${a.text}`).join("\n");
    },
  },

  // ── Prototype Brief → User Testing goal ──
  {
    sourceStep: "prototype_brief",
    targetStep: "user_testing",
    targetField: "testGoal",
    label: "מטרת אב-טיפוס → מטרת בדיקה",
    extract: (d) => d?.objective,
  },

  // ── Assumption Selection → User Testing hypothesis ──
  {
    sourceStep: "assumption_selection",
    targetStep: "user_testing",
    targetField: "hypothesis",
    label: "הנחה מסוכנת → השערת בדיקה",
    extract: (d) => {
      const riskiest = d?.assumptions?.filter((a: any) => a.isRiskiest && a.text?.trim());
      if (!riskiest?.length) return undefined;
      return `אנו מאמינים ש: ${riskiest[0].text}`;
    },
  },

  // ── Prototype Brief success criteria → User Testing key findings context ──
  {
    sourceStep: "prototype_brief",
    targetStep: "user_testing",
    targetField: "_successCriteria",
    label: "קריטריוני הצלחה → הקשר בדיקה",
    extract: (d) => d?.successCriteria,
  },
];

/**
 * Get all available linked data for a given target step
 */
export function getLinkedData(
  targetStep: string,
  allStepData: Record<string, { data: any; completed: boolean }>
): { field: string; value: string; label: string; sourceStep: string }[] {
  const results: { field: string; value: string; label: string; sourceStep: string }[] = [];

  for (const link of DATA_LINKS) {
    if (link.targetStep !== targetStep) continue;

    const sourceEntry = allStepData[link.sourceStep];
    if (!sourceEntry?.data) continue;

    const value = link.extract(sourceEntry.data);
    if (value?.trim()) {
      results.push({
        field: link.targetField,
        value,
        label: link.label,
        sourceStep: link.sourceStep,
      });
    }
  }

  return results;
}
