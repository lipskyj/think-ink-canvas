import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Pencil } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";

const PointOfView = () => {
  const { getStepData } = useProject();
  const [user, setUser] = useState("");
  const [need, setNeed] = useState("");
  const [insight, setInsight] = useState("");
  const [editing, setEditing] = useState(false);

  // Auto-derive POV from previous steps (persona + empathy + five whys)
  const derived = useMemo(() => {
    const persona = getStepData("user_persona") || {};
    const empathy = getStepData("empathy_map") || {};
    const fiveWhys = getStepData("five_whys") || {};

    const u =
      (persona.name ? `${persona.name}${persona.occupation ? `, ${persona.occupation}` : ""}` : "") ||
      empathy.userDesc ||
      "";
    const n = persona.goals || empathy.quadrants?.does || "";
    let root = "";
    const whys = fiveWhys.whys || [];
    for (let i = whys.length - 1; i >= 0; i--) {
      if (whys[i]?.trim()) { root = whys[i]; break; }
    }
    const ins = root || persona.frustrations || empathy.quadrants?.feels || "";
    return { user: u, need: n, insight: ins };
  }, [getStepData]);

  useEffect(() => {
    const saved = getStepData("pov_statement");
    if (saved?.user || saved?.need || saved?.insight) {
      setUser(saved.user || "");
      setNeed(saved.need || "");
      setInsight(saved.insight || "");
    } else {
      setUser(derived.user);
      setNeed(derived.need);
      setInsight(derived.insight);
    }
  }, [getStepData, derived]);

  const regenerate = () => {
    setUser(derived.user);
    setNeed(derived.need);
    setInsight(derived.insight);
  };

  // Strip redundant connector words so the template doesn't double them
  const cleanNeed = need.trim().replace(/^(צריך|צריכה|צריכים|צריכות|רוצה|רוצים)\s+/u, "");
  const cleanInsight = insight.trim().replace(/^(כי|מפני ש|מכיוון ש|בגלל ש|בגלל)\s+/u, "");

  const getData = useCallback(
    () => ({ user, need: cleanNeed, insight: cleanInsight }),
    [user, cleanNeed, cleanInsight]
  );
  const hasContent = !!(user.trim() || need.trim() || insight.trim());

  return (
    <StepPage stepKey="pov_statement" onSave={getData} canComplete={hasContent}>
      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <p className="font-hand text-lg text-foreground/80">
          ה-POV נוצר אוטומטית מהפרסונה, מפת האמפתיה וחמישה למה. אפשר לערוך אם רוצים.
        </p>
      </div>

      <div className="sketch-card mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="pill-chip pill-chip-outline">הצהרת ה-POV שלכם</span>
          <div className="flex gap-2">
            <button onClick={regenerate} className="sketch-btn-outline text-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> חולל מחדש מהנתונים
            </button>
            <button onClick={() => setEditing(!editing)} className="sketch-btn-outline text-sm flex items-center gap-1">
              <Pencil className="h-3 w-3" /> {editing ? "סיים" : "ערוך"}
            </button>
          </div>
        </div>

        {!editing ? (
          <p className="text-2xl leading-relaxed">
            <strong>{user || "___"}</strong> צריך <strong>{need || "___"}</strong> כי <strong>{insight || "___"}</strong>.
          </p>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">משתמש</label>
              <input className="sketch-input" value={user} onChange={(e) => setUser(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">צורך</label>
              <input className="sketch-input" value={need} onChange={(e) => setNeed(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">תובנה</label>
              <input className="sketch-input" value={insight} onChange={(e) => setInsight(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {!hasContent && (
        <p className="font-hand text-muted-foreground text-center">
          השלימו קודם את פרסונת המשתמש, מפת האמפתיה וחמישה למה כדי שנוכל לחולל POV עבורכם.
        </p>
      )}
    </StepPage>
  );
};

export default PointOfView;
