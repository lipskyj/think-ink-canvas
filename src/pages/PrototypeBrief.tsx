import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";
import { BRIEF_QUESTIONS } from "@/lib/briefQuestions";

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
  briefingAnswers: Record<string, string>;
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
  id: string;
  name: string;
  description: string;
  bucket: Bucket | "unassigned";
}

const BUCKETS: { key: Bucket | "unassigned"; label: string; desc: string; bg: string }[] = [
  { key: "unassigned", label: "תכונות מוצעות", desc: "גררו לאחת הקטגוריות מימין/למטה", bg: "bg-secondary/30" },
  { key: "must", label: "Must — חובה", desc: "בלי זה אין מוצר", bg: "bg-[hsl(var(--primary)/0.10)]" },
  { key: "should", label: "Should — חשוב", desc: "חשוב אך לא חוסם", bg: "bg-[hsl(var(--accent)/0.18)]" },
  { key: "could", label: "Could — אם יש זמן", desc: "Nice-to-have", bg: "bg-[hsl(var(--highlight)/0.15)]" },
  { key: "wont", label: "Won't — לא הפעם", desc: "מחוץ להיקף", bg: "bg-foreground/[0.05]" },
];

const PrototypeBrief = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const { aiEnabled } = useAdmin();
  const [brief, setBrief] = useState<BriefState>({
    objective: "", must: "", should: "", could: "", wont: "",
    assumptions: "", styleVibe: "", styleNotes: "", successCriteria: "",
    briefingAnswers: {},
  });
  const [suggestedFeatures, setSuggestedFeatures] = useState<SuggestedFeature[]>([]);
  const [aiFeaturesLoading, setAiFeaturesLoading] = useState(false);

  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const saved = getStepData("prototype_brief");
    if (saved) {
      setBrief((prev) => ({
        ...prev,
        ...saved,
        must: saved.must || saved.keyFeatures || "",
        briefingAnswers: saved.briefingAnswers || {},
      }));
      if (Array.isArray(saved.suggestedFeatures)) setSuggestedFeatures(saved.suggestedFeatures.map((f: any) => ({ ...f, id: f.id || crypto.randomUUID() })));
      if (saved.seeded) setSeeded(true);
    }
  }, [getStepData]);

  // Derive suggestions from earlier steps — runs ONCE, then sets a flag so a
  // user who deletes the suggestions doesn't get them re-injected on next render.
  const seedFromPreviousSteps = useCallback(() => {
    const prev = getAllPreviousData("prototype_brief") as Record<string, any>;
    const derived: SuggestedFeature[] = [];

    const ideation = prev?.ideation;
    if (ideation?.ideas && Array.isArray(ideation.ideas)) {
      for (const idea of ideation.ideas) {
        const text = (idea?.text || "").trim();
        if (text) derived.push({ id: crypto.randomUUID(), name: text, description: "", bucket: "unassigned" });
      }
    }

    const matrix = prev?.effort_impact;
    if (matrix?.items && Array.isArray(matrix.items)) {
      for (const it of matrix.items) {
        const text = (it?.text || it?.name || "").trim();
        const isQuickWin = (it?.impact ?? 0) >= 0.5 && (it?.effort ?? 1) <= 0.5;
        if (text && isQuickWin) derived.push({ id: crypto.randomUUID(), name: text, description: "Quick win", bucket: "unassigned" });
      }
    }

    const hmw = prev?.how_might_we;
    if (hmw?.questions && Array.isArray(hmw.questions)) {
      for (const q of hmw.questions.slice(0, 3)) {
        const text = (typeof q === "string" ? q : q?.text || "").trim();
        if (text) derived.push({ id: crypto.randomUUID(), name: text, description: "מתוך HMW", bucket: "unassigned" });
      }
    }

    const seen = new Set<string>();
    const unique = derived.filter((d) => {
      const k = d.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (unique.length > 0) {
      setSuggestedFeatures((curr) => [...curr, ...unique]);
    }
    setSeeded(true);
  }, [getAllPreviousData]);

  useEffect(() => {
    if (seeded) return;
    if (suggestedFeatures.length > 0) {
      setSeeded(true);
      return;
    }
    seedFromPreviousSteps();
  }, [seeded, suggestedFeatures.length, seedFromPreviousSteps]);

  // Keep textual must/should/could/wont in sync with the drag-and-drop board.
  useEffect(() => {
    if (suggestedFeatures.length === 0) return;
    const lines = (b: Bucket) =>
      suggestedFeatures
        .filter((f) => f.bucket === b)
        .map((f) => `• ${f.name}${f.description ? ` — ${f.description}` : ""}`)
        .join("\n");
    setBrief((prev) => ({
      ...prev,
      must: lines("must"),
      should: lines("should"),
      could: lines("could"),
      wont: lines("wont"),
    }));
  }, [suggestedFeatures]);

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
          id: crypto.randomUUID(),
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

      {/* Guided briefing questions with template chips */}
      <div className="sketch-card mb-6">
        <label className="font-sketch text-xl block mb-1">7 שאלות לפני שמתחילים לבנות</label>
        <p className="font-hand text-muted-foreground text-sm mb-4">
          ענו על מה שרלוונטי. לחיצה על תבנית מוסיפה אותה לתשובה — אפשר לערוך אחרי.
        </p>
        <div className="space-y-5">
          {BRIEF_QUESTIONS.map((q) => {
            const value = brief.briefingAnswers[q.key] || "";
            const setValue = (next: string) =>
              setBrief((prev) => ({
                ...prev,
                briefingAnswers: { ...prev.briefingAnswers, [q.key]: next },
              }));
            return (
              <div key={q.key} className="sketch-border-thin p-3 bg-background rounded">
                <div className="font-sketch text-base mb-1">{q.title}</div>
                <div className="font-hand text-xs text-muted-foreground mb-2">{q.hint}</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {q.templates.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue(value ? `${value}\n• ${t}` : `• ${t}`)}
                      className="pill-chip pill-chip-outline text-xs cursor-pointer"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
                <textarea
                  className="sketch-input min-h-[70px] resize-none notebook-lines text-sm"
                  placeholder="כתבו את התשובה שלכם, או לחצו על תבנית למעלה..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            );
          })}
        </div>
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

        {/* MoSCoW — drag-and-drop board with AI-suggested features */}
        <div className="sketch-card">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label className="font-sketch text-xl">MoSCoW — תיעדוף תכונות</label>
            {aiEnabled && (
              <button
                onClick={generateAiFeatures}
                disabled={aiFeaturesLoading}
                className="sketch-btn flex items-center gap-2 text-sm"
              >
                {aiFeaturesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {suggestedFeatures.length ? "ייצר תכונות מחדש" : "הצע תכונות עם AI"}
              </button>
            )}
          </div>
          <p className="font-hand text-muted-foreground text-sm mb-2">
            ה-AI מציע תכונות (leaderboard, צ׳אט, גלריה, התראות...). גררו כל תכונה ל-Must / Should / Could / Won't.
          </p>

          <AddFeatureRow
            onAdd={(name) => setSuggestedFeatures((prev) => [...prev, { id: crypto.randomUUID(), name, description: "", bucket: "unassigned" }])}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {BUCKETS.map((b) => (
              <BucketLane
                key={b.key}
                config={b}
                features={suggestedFeatures.filter((f) => f.bucket === b.key)}
                onDrop={(id) => setSuggestedFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, bucket: b.key } : f)))}
                onRemove={(id) => setSuggestedFeatures((prev) => prev.filter((f) => f.id !== id))}
              />
            ))}
          </div>

          {suggestedFeatures.length === 0 && (
            <p className="font-hand text-sm text-muted-foreground mt-3 text-center">
              עדיין אין תכונות. לחצו על "הצע תכונות עם AI" או הוסיפו ידנית.
            </p>
          )}
        </div>



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

function AddFeatureRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        className="sketch-input flex-1"
        placeholder="הוסיפו תכונה משלכם..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
      />
      <button
        type="button"
        onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue(""); } }}
        className="sketch-btn-outline flex items-center gap-1 text-sm px-3 py-2"
      >
        <Plus className="h-4 w-4" /> הוסף
      </button>
    </div>
  );
}

function BucketLane({
  config,
  features,
  onDrop,
  onRemove,
}: {
  config: { key: Bucket | "unassigned"; label: string; desc: string; bg: string };
  features: SuggestedFeature[];
  onDrop: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`sketch-border-thin p-3 min-h-[140px] transition-all ${config.bg} ${over ? "ring-2 ring-foreground" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id);
      }}
    >
      <div className="mb-2">
        <div className="font-sketch text-base">{config.label}</div>
        <div className="font-hand text-xs text-muted-foreground">{config.desc}</div>
      </div>
      <div className="space-y-2">
        {features.map((f) => (
          <div
            key={f.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", f.id)}
            className="bg-background sketch-border-thin px-3 py-2 cursor-grab active:cursor-grabbing flex items-start gap-2"
          >
            <div className="flex-1 min-w-0">
              <div className="font-sketch text-sm truncate">{f.name}</div>
              {f.description && <div className="text-xs text-muted-foreground line-clamp-2">{f.description}</div>}
            </div>
            <button onClick={() => onRemove(f.id)} className="text-muted-foreground hover:text-foreground p-0.5">
              <span className="text-xs">×</span>
            </button>
          </div>
        ))}
        {features.length === 0 && (
          <div className="text-xs text-muted-foreground font-hand text-center py-3 border-2 border-dashed border-foreground/15 rounded">
            גררו לכאן
          </div>
        )}
      </div>
    </div>
  );
}

export default PrototypeBrief;
