import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";

interface BriefState {
  objective: string;
  must: string;
  should: string;
  could: string;
  wont: string;
  assumptions: string;
  styleVibe: string;
  styleNotes: string;
  successCriteria: string;
  // legacy
  keyFeatures?: string;
  fidelity?: string;
}

type Bucket = "must" | "should" | "could" | "wont";

const STYLE_VIBES = [
  { key: "cyber", label: "סייבר / ניאון", swatch: ["#0a0a0a", "#00ff66", "#ff0055", "#7b81ff"], font: "'Heebo', sans-serif" },
  { key: "light", label: "בהיר ורגוע", swatch: ["#f5f7fb", "#a0caff", "#bdd0fe", "#ffd0e8"], font: "'Heebo', sans-serif" },
  { key: "futuristic", label: "פוטוריסטי", swatch: ["#0a0a14", "#6c5cff", "#00e5ff", "#ff4dd2"], font: "'Heebo', sans-serif" },
  { key: "playful", label: "שובב / סטיקרים", swatch: ["#f7e8d0", "#ff6b6b", "#ffd166", "#06d6a0"], font: "'Heebo', sans-serif" },
  { key: "editorial", label: "אדיטוריאל / בולד", swatch: ["#ffffff", "#111111", "#333333", "#f5f5f5"], font: "'Heebo', serif" },
  { key: "soft_glass", label: "זכוכית רכה", swatch: ["#e9e6ff", "#c8c0ff", "#ffd0e8", "#a8c8ff"], font: "'Heebo', sans-serif" },
  { key: "organic", label: "אורגני / טבע", swatch: ["#f0ebe0", "#7f8f56", "#c9a87a", "#3a4a2a"], font: "'Heebo', serif" },
  { key: "fun_bright", label: "כיף ובהיר", swatch: ["#2e6cff", "#ffd400", "#ff5e8a", "#00c9b1"], font: "'Heebo', sans-serif" },
  { key: "warm_elegant", label: "חם ואלגנטי", swatch: ["#f4ede2", "#caa478", "#8b6f47", "#3d2e1f"], font: "'Heebo', serif" },
];

interface SuggestedFeature {
  name: string;
  description: string;
  bucket: Bucket | "unassigned";
}

const PrototypeBrief = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const { aiEnabled } = useAdmin();
  const [brief, setBrief] = useState<BriefState>({
    objective: "", must: "", should: "", could: "", wont: "",
    assumptions: "", styleVibe: "", styleNotes: "", successCriteria: "",
  });
  const [suggestedFeatures, setSuggestedFeatures] = useState<SuggestedFeature[]>([]);
  const [aiFeaturesLoading, setAiFeaturesLoading] = useState(false);

  useEffect(() => {
    const saved = getStepData("prototype_brief");
    if (saved) {
      setBrief((prev) => ({
        ...prev,
        ...saved,
        must: saved.must || saved.keyFeatures || "",
      }));
      if (Array.isArray(saved.suggestedFeatures)) setSuggestedFeatures(saved.suggestedFeatures);
    }
  }, [getStepData]);

  const update = (field: keyof BriefState, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  const autoFillFields = useMemo(() => ({
    objective: { value: brief.objective, set: (v: string) => update("objective", v) },
    keyFeatures: { value: brief.must, set: (v: string) => update("must", v) },
    assumptions: { value: brief.assumptions, set: (v: string) => update("assumptions", v) },
  }), [brief.objective, brief.must, brief.assumptions]);
  useAutoFill("prototype_brief", autoFillFields);

  const getData = useCallback(() => ({ ...brief, suggestedFeatures }), [brief, suggestedFeatures]);
  const hasContent = !!(brief.objective.trim() || brief.must.trim());
  const previousData = getAllPreviousData("prototype_brief");

  const appendToBucket = (bucket: Bucket, line: string) => {
    setBrief((prev) => {
      const existing = (prev[bucket] || "").trim();
      const next = existing ? `${existing}\n• ${line}` : `• ${line}`;
      return { ...prev, [bucket]: next };
    });
  };

  const assignFeature = (index: number, bucket: Bucket) => {
    setSuggestedFeatures((prev) => {
      const copy = [...prev];
      const f = copy[index];
      if (!f) return prev;
      copy[index] = { ...f, bucket };
      appendToBucket(bucket, `${f.name}${f.description ? ` — ${f.description}` : ""}`);
      return copy;
    });
  };

  const generateAiFeatures = async () => {
    setAiFeaturesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey: "prototype_brief",
          stepTitle: "Brief — תכונות מוצעות",
          mode: "section",
          sectionKey: "features_json",
          sectionPrompt: `על בסיס כיוון הפתרון של הצוות, הצע 6 תכונות מוצר קונקרטיות שיכולות להתאים (לדוגמה: leaderboard, צ׳אט קבוצתי, גלריה, התראות, פרופיל, שיתוף, וכו'). החזר אך ורק מערך JSON תקין בפורמט: [{"name":"שם התכונה","description":"משפט קצר בעברית"}]. בלי טקסט נוסף, בלי code fences.`,
          currentData: { objective: brief.objective, must: brief.must },
          previousData,
        },
      });
      if (error) throw error;
      const raw = (data?.content || "").trim().replace(/```json?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSuggestedFeatures(parsed.map((f: any) => ({
          name: String(f.name || "").trim(),
          description: String(f.description || "").trim(),
          bucket: "unassigned" as const,
        })).filter((f) => f.name));
      }
    } catch (e) {
      console.error("AI features failed", e);
    } finally {
      setAiFeaturesLoading(false);
    }
  };


  return (
    <StepPage stepKey="prototype_brief" onSave={getData} canComplete={hasContent}>
      <CoherenceTracker stepKey="prototype_brief" currentData={brief} />

      <div className="sketch-border p-5 mb-6 bg-secondary/30">
        <p className="font-hand text-lg">
          הבריף הוא חוזה קצר עם עצמכם — מה ייבנה, באיזה סדר עדיפויות, ואיך זה יראה ויורגש.
        </p>
      </div>

      <div className="space-y-5">
        {/* Objective */}
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-xl block mb-1">מטרה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="objective" currentData={brief} previousData={previousData} onApply={(v) => update("objective", v)} />
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-3">מה אתם מנסים ללמוד, לאמת או להוכיח?</p>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="לדוגמה: לוודא שמשתמשים מבינים את הצעת הערך תוך 10 שניות..." value={brief.objective} onChange={(e) => update("objective", e.target.value)} />
        </div>

        {/* MoSCoW */}
        <div className="sketch-card">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label className="font-sketch text-xl">MoSCoW — תיעדוף תכונות</label>
            <span className="pill-chip pill-chip-outline text-[10px]">Must · Should · Could · Won't</span>
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-4">
            מיינו את התכונות לארבע קטגוריות. זה מה שמבדיל MVP ממוצר נפוח.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="sketch-border-thin p-3 bg-[hsl(var(--primary)/0.08)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Must — חובה</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="must" currentData={brief} previousData={previousData} onApply={(v) => update("must", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">בלי זה אין מוצר. ליבת ה-MVP.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="התכונות הקריטיות..." value={brief.must} onChange={(e) => update("must", e.target.value)} />
            </div>

            <div className="sketch-border-thin p-3 bg-[hsl(var(--accent)/0.15)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Should — חשוב</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="should" currentData={brief} previousData={previousData} onApply={(v) => update("should", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">חשוב מאוד, אך לא מעכב השקה.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="תכונות שתשתדלו להכניס..." value={brief.should} onChange={(e) => update("should", e.target.value)} />
            </div>

            <div className="sketch-border-thin p-3 bg-[hsl(var(--highlight)/0.12)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Could — אם יש זמן</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="could" currentData={brief} previousData={previousData} onApply={(v) => update("could", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">Nice-to-have. רק אם נשאר זמן.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="תכונות בונוס..." value={brief.could} onChange={(e) => update("could", e.target.value)} />
            </div>

            <div className="sketch-border-thin p-3 bg-foreground/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sketch text-base">Won't — לא הפעם</span>
                <SectionHelper stepKey="prototype_brief" sectionKey="wont" currentData={brief} previousData={previousData} onApply={(v) => update("wont", v)} />
              </div>
              <p className="font-hand text-xs text-muted-foreground mb-2">מחוץ להיקף. שומרים לגרסה הבאה.</p>
              <textarea className="sketch-input min-h-[100px] resize-none" placeholder="מה במפורש לא בונים עכשיו..." value={brief.wont} onChange={(e) => update("wont", e.target.value)} />
            </div>
          </div>
        </div>

        {/* AI feature suggestion → categorize */}
        {aiEnabled && (
          <div className="sketch-card">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="font-sketch text-xl">הצעות תכונות מה-AI</label>
              <button
                onClick={generateAiFeatures}
                disabled={aiFeaturesLoading}
                className="sketch-btn flex items-center gap-2 text-sm"
              >
                {aiFeaturesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {suggestedFeatures.length ? "ייצר מחדש" : "הצע תכונות לפי כיוון הפתרון"}
              </button>
            </div>
            <p className="font-hand text-muted-foreground text-sm mb-3">
              ה-AI יציע תכונות אפשריות (leaderboard, צ׳אט קבוצתי, גלריה...). שייכו כל אחת ל-Must / Should / Could / Won't.
            </p>
            {suggestedFeatures.length > 0 && (
              <div className="space-y-2">
                {suggestedFeatures.map((f, i) => (
                  <div key={i} className="sketch-border-thin p-3 flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-sketch text-base">{f.name}</div>
                      {f.description && <div className="text-sm text-muted-foreground">{f.description}</div>}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {(["must", "should", "could", "wont"] as Bucket[]).map((b) => (
                        <button
                          key={b}
                          onClick={() => assignFeature(i, b)}
                          className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                            f.bucket === b
                              ? "bg-foreground text-background border-foreground"
                              : "border-foreground/30 hover:border-foreground"
                          }`}
                        >
                          {b === "must" ? "Must" : b === "should" ? "Should" : b === "could" ? "Could" : "Won't"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Style / vibe with visual swatches */}
        <div className="sketch-card">
          <label className="font-sketch text-xl block mb-1">סגנון והעדפות עיצוב</label>
          <p className="font-hand text-muted-foreground text-sm mb-3">בחרו טעם ויזואלי — והוסיפו פירוט.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {STYLE_VIBES.map((v) => {
              const active = brief.styleVibe === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => update("styleVibe", active ? "" : v.key)}
                  className={`text-right border-2 rounded-md p-3 transition-all ${
                    active ? "border-foreground bg-secondary/40" : "border-foreground/20 hover:border-foreground/60"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-2">
                    {v.swatch.map((c, idx) => (
                      <div key={idx} className="w-6 h-6 rounded-sm border border-foreground/20" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="font-sketch text-base" style={{ fontFamily: v.font }}>{v.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: v.font }}>
                    Aa — שלום עולם
                  </div>
                </button>
              );
            })}
          </div>
          <textarea
            className="sketch-input min-h-[80px] resize-none notebook-lines"
            placeholder="הערות סגנון: פלטה, טיפוגרפיה, השראות (מותגים/אתרים), אווירה..."
            value={brief.styleNotes}
            onChange={(e) => update("styleNotes", e.target.value)}
          />
        </div>


        {/* Assumptions */}
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-xl block mb-2">הנחות לבדיקה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="assumptions" currentData={brief} previousData={previousData} onApply={(v) => update("assumptions", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="אילו הנחות אנחנו בודקים?" value={brief.assumptions} onChange={(e) => update("assumptions", e.target.value)} />
        </div>

        {/* Success */}
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-sketch text-xl block mb-2">קריטריוני הצלחה</label>
            <SectionHelper stepKey="prototype_brief" sectionKey="successCriteria" currentData={brief} previousData={previousData} onApply={(v) => update("successCriteria", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="איך תדעו אם אב-הטיפוס הצליח?" value={brief.successCriteria} onChange={(e) => update("successCriteria", e.target.value)} />
        </div>
      </div>
    </StepPage>
  );
};

export default PrototypeBrief;
