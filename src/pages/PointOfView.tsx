import { useState, useEffect, useCallback, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import LinkedDataBanner from "@/components/LinkedDataBanner";
import SectionHelper from "@/components/SectionHelper";
import { useAutoFill } from "@/hooks/useAutoFill";

const PointOfView = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [user, setUser] = useState("");
  const [need, setNeed] = useState("");
  const [insight, setInsight] = useState("");

  useEffect(() => {
    const saved = getStepData("pov_statement");
    if (saved) {
      if (saved.user) setUser(saved.user);
      if (saved.need) setNeed(saved.need);
      if (saved.insight) setInsight(saved.insight);
    }
  }, [getStepData]);

  const autoFillFields = useMemo(() => ({
    user: { value: user, set: setUser },
    need: { value: need, set: setNeed },
    insight: { value: insight, set: setInsight },
  }), [user, need, insight]);
  useAutoFill("pov_statement", autoFillFields);

  const handleApplyLinked = (field: string, value: string) => {
    if (field === "user" && !user.trim()) setUser(value);
    if (field === "need" && !need.trim()) setNeed(value);
    if (field === "insight" && !insight.trim()) setInsight(value);
  };

  const getData = useCallback(() => ({ user, need, insight }), [user, need, insight]);
  const hasContent = !!(user.trim() || need.trim() || insight.trim());
  const previousData = getAllPreviousData("pov_statement");

  return (
    <StepPage stepKey="pov_statement" onSave={getData} canComplete={hasContent}>
      <LinkedDataBanner stepKey="pov_statement" onApplyField={handleApplyLinked} />

      <div className="sketch-border p-6 mb-6 bg-secondary/20">
        <p className="text-lg text-center text-muted-foreground mb-4">
          [משתמש] צריך [צורך] כי [תובנה]
        </p>
      </div>

      <div className="space-y-4">
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-lg block mb-2">👤 משתמש</label>
            <SectionHelper stepKey="pov_statement" sectionKey="user" currentData={{ user, need, insight }} previousData={previousData} onApply={(v) => setUser(v)} />
          </div>
          <p className="text-muted-foreground text-sm mb-2">מיהו המשתמש הספציפי שאתם מעצבים עבורו?</p>
          <input className="sketch-input" placeholder="סטודנט דור ראשון שמנסה..." value={user} onChange={(e) => setUser(e.target.value)} />
        </div>
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-lg block mb-2">💡 צורך</label>
            <SectionHelper stepKey="pov_statement" sectionKey="need" currentData={{ user, need, insight }} previousData={previousData} onApply={(v) => setNeed(v)} />
          </div>
          <p className="text-muted-foreground text-sm mb-2">מה הצורך של המשתמש? (השתמשו בפועל, לא בפתרון)</p>
          <input className="sketch-input" placeholder="...צריך להרגיש בטוח כשהוא מנווט..." value={need} onChange={(e) => setNeed(e.target.value)} />
        </div>
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-lg block mb-2">🔍 תובנה</label>
            <SectionHelper stepKey="pov_statement" sectionKey="insight" currentData={{ user, need, insight }} previousData={previousData} onApply={(v) => setInsight(v)} />
          </div>
          <p className="text-muted-foreground text-sm mb-2">למה? איזו תובנה מפתיעה גיליתם?</p>
          <input className="sketch-input" placeholder="...כי אין להם בני משפחה לשאול..." value={insight} onChange={(e) => setInsight(e.target.value)} />
        </div>
      </div>

      {(user || need || insight) && (
        <div className="mt-6 sketch-border p-5 bg-card animate-fade-in">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">הצהרת ה-POV שלכם</h3>
          <p className="text-xl leading-relaxed">
            <strong>{user || "___"}</strong> צריך <strong>{need || "___"}</strong> כי <strong>{insight || "___"}</strong>.
          </p>
        </div>
      )}
    </StepPage>
  );
};

export default PointOfView;
