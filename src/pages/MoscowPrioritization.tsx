import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, GripVertical, Loader2, Plus, Sparkles, Target, X } from "lucide-react";
import StepPage from "@/components/StepPage";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAdmin } from "@/contexts/AdminContext";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Bucket = "must" | "should" | "could" | "wont";

interface MoscowFeature {
  id: string;
  name: string;
  description: string;
  bucket: Bucket | "unassigned";
}

const BUCKETS: { key: Bucket | "unassigned"; label: string; desc: string; bg: string }[] = [
  { key: "unassigned", label: "תכונות לבחירה", desc: "כל מה שאפשר לבנות — עדיין לא התחייבנו", bg: "bg-secondary/30" },
  { key: "must", label: "Must — חובה", desc: "בלי זה אין MVP עובד", bg: "bg-[hsl(var(--highlight)/0.18)]" },
  { key: "should", label: "Should — חשוב", desc: "מוסיף ערך, אבל לא חוסם השקה", bg: "bg-[hsl(var(--accent)/0.18)]" },
  { key: "could", label: "Could — אם יש זמן", desc: "נחמד, רק אחרי שהחובה עובד", bg: "bg-[hsl(var(--primary)/0.10)]" },
  { key: "wont", label: "Won't — לא הפעם", desc: "מחוץ להיקף של ה-MVP", bg: "bg-foreground/[0.05]" },
];

const bucketText = (features: MoscowFeature[], bucket: Bucket) =>
  features
    .filter((f) => f.bucket === bucket)
    .map((f) => `• ${f.name}${f.description ? ` — ${f.description}` : ""}`)
    .join("\n");

const toFeature = (name: string, description = "", bucket: MoscowFeature["bucket"] = "unassigned"): MoscowFeature => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  description: description.trim(),
  bucket,
});

const splitLines = (value: string | undefined) =>
  (value || "")
    .split(/\n|•|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

export default function MoscowPrioritization() {
  const { getStepData } = useProject();
  const { aiEnabled } = useAdmin();
  const [features, setFeatures] = useState<MoscowFeature[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const saved = getStepData("moscow_prioritization");
    if (!saved) return;
    if (Array.isArray(saved.features)) {
      setFeatures(saved.features.map((f: any) => ({ ...f, id: f.id || crypto.randomUUID() })));
    }
    if (saved.seeded) setSeeded(true);
  }, [getStepData]);

  const seedFromWork = useCallback(() => {
    const brief = getStepData("prototype_brief") || {};
    const matrix = getStepData("effort_impact") || {};
    const ideation = getStepData("ideation") || {};
    const derived: MoscowFeature[] = [];

    if (Array.isArray(brief.suggestedFeatures)) {
      brief.suggestedFeatures.forEach((f: any) => {
        const name = String(f?.name || "").trim();
        if (name) derived.push(toFeature(name, String(f?.description || ""), f?.bucket || "unassigned"));
      });
    }

    splitLines(brief.must).forEach((name) => derived.push(toFeature(name, "מהבריף", "must")));
    splitLines(brief.should).forEach((name) => derived.push(toFeature(name, "מהבריף", "should")));
    splitLines(brief.could).forEach((name) => derived.push(toFeature(name, "מהבריף", "could")));
    splitLines(brief.wont).forEach((name) => derived.push(toFeature(name, "מהבריף", "wont")));

    if (matrix.bestChoice?.text) {
      derived.push(toFeature(matrix.bestChoice.text, "הבחירה הטובה מהמטריצה", "must"));
    }
    if (Array.isArray(matrix.ideas)) {
      matrix.ideas
        .filter((idea: any) => idea?.placed && idea.x < 50 && idea.y < 50)
        .forEach((idea: any) => derived.push(toFeature(idea.text, "ניצחון מהיר", "must")));
    }

    const ideationIdeas = Array.isArray(ideation.ideas) ? ideation.ideas : [];
    ideationIdeas
      .filter((idea: any) => idea?.starred && idea?.text)
      .forEach((idea: any) => derived.push(toFeature(idea.text, "רעיון שסומן", "unassigned")));

    Object.values(brief.briefingAnswers || {}).forEach((answer) => {
      splitLines(String(answer)).forEach((name) => derived.push(toFeature(name, "מתוך שאלות הבריף", "unassigned")));
    });

    const seen = new Set<string>();
    const unique = derived.filter((feature) => {
      const key = feature.name.toLowerCase();
      if (!feature.name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setFeatures(unique);
    setSeeded(true);
  }, [getStepData]);

  useEffect(() => {
    if (!seeded && features.length === 0) seedFromWork();
  }, [features.length, seeded, seedFromWork]);

  const addFeature = () => {
    const name = newFeature.trim();
    if (!name) return;
    setFeatures((prev) => [...prev, toFeature(name)]);
    setNewFeature("");
  };

  const mustLimit = Math.max(1, Math.ceil(features.length * 0.3));

  const moveFeature = (id: string, bucket: MoscowFeature["bucket"]) => {
    if (bucket === "must") {
      const current = features.find((f) => f.id === id);
      if (current?.bucket !== "must") {
        const mustCount = features.filter((f) => f.bucket === "must").length;
        if (mustCount >= mustLimit) {
          toast({
            title: "יותר מדי Must",
            description: `MVP חייב להיות צמצום. מותר עד ${mustLimit} תכונות ב-Must (30% מהרשימה). הורידו אחת קודם.`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    setFeatures((prev) => prev.map((feature) => (feature.id === id ? { ...feature, bucket } : feature)));
  };

  const generateAiFeatures = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          stepKey: "moscow_prioritization",
          stepTitle: "MoSCoW — תיעדוף תכונות",
          mode: "section",
          sectionKey: "features_json",
          sectionPrompt: `על בסיס הבריף והרעיון שנבחר במטריצה, הצע 8 תכונות מוצר קונקרטיות ל-MVP. החזר רק JSON תקין: [{"name":"שם התכונה","description":"משפט קצר","bucket":"must|should|could|wont"}]. חובה: עד 3 Must בלבד, כי MVP לא יכול לכלול הכל.`,
          currentData: { features },
          previousData: {
            prototype_brief: getStepData("prototype_brief"),
            effort_impact: getStepData("effort_impact"),
            ideation: getStepData("ideation"),
          },
        },
      });
      if (error) throw error;
      const raw = (data?.content || "").trim().replace(/```json?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFeatures(parsed.map((f: any) => toFeature(String(f.name || ""), String(f.description || ""), f.bucket || "unassigned")).filter((f) => f.name));
        setSeeded(true);
      }
    } catch (error) {
      console.error("AI MoSCoW failed", error);
    } finally {
      setAiLoading(false);
    }
  };

  const mvpFeatures = features.filter((feature) => feature.bucket === "must");
  const hasContent = features.some((feature) => feature.bucket !== "unassigned");
  const getData = useCallback(() => ({
    features,
    seeded,
    must: bucketText(features, "must"),
    should: bucketText(features, "should"),
    could: bucketText(features, "could"),
    wont: bucketText(features, "wont"),
  }), [features, seeded]);

  return (
    <StepPage stepKey="moscow_prioritization" onSave={getData} canComplete={hasContent}>
      <CoherenceTracker stepKey="moscow_prioritization" currentData={getData()} />

      <div className="sketch-border p-5 mb-6 bg-secondary/30">
        <div className="flex items-start gap-3">
          <Target className="h-6 w-6 mt-1 shrink-0" />
          <div>
            <h2 className="font-sketch text-2xl mb-2">MVP הוא בחירה, לא רשימת חלומות.</h2>
            <p className="font-hand text-lg text-muted-foreground leading-snug">
              אחרי הבריף יש הרבה רעיונות טובים, אבל לא הכול אפשרי בבנייה ראשונה. בחרו מה חייב להיכנס עכשיו, מה חשוב אחר כך, ומה נשאר מחוץ לסקופ.
            </p>
          </div>
        </div>
      </div>

      {mvpFeatures.length > 0 && (
        <div className="sketch-border p-5 mb-6 bg-[hsl(var(--highlight))] text-[hsl(var(--highlight-foreground))]">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span className="font-sketch text-xl">זה ה-MVP שלכם כרגע</span>
            </div>
            <span className="pill-chip pill-chip-outline bg-background/80 text-foreground text-xs">
              {mvpFeatures.length} / {mustLimit} Must (עד 30%)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mvpFeatures.map((feature) => (
              <span key={feature.id} className="pill-chip pill-chip-outline bg-background/80 text-foreground">
                {feature.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="sketch-card mb-6">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <label className="font-sketch text-xl">תכונות לתיעדוף</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={seedFromWork} className="sketch-btn-outline text-sm inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> טען מהבריף והמטריצה
            </button>
            {aiEnabled && (
              <button type="button" onClick={generateAiFeatures} disabled={aiLoading} className="sketch-btn text-sm inline-flex items-center gap-2 disabled:opacity-50">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                הצע תיעדוף עם AI
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="sketch-input flex-1"
            placeholder="הוסיפו תכונה..."
            value={newFeature}
            onChange={(event) => setNewFeature(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addFeature()}
          />
          <button type="button" onClick={addFeature} className="sketch-btn-outline flex items-center gap-1 text-sm px-3 py-2">
            <Plus className="h-4 w-4" /> הוסף
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {BUCKETS.filter((bucket) => {
          // Hide the "unassigned" bank when it's empty so the lanes don't show a ghost column
          if (bucket.key !== "unassigned") return true;
          return features.some((feature) => feature.bucket === "unassigned");
        }).map((bucket) => (
          <BucketLane
            key={bucket.key}
            config={bucket}
            features={features.filter((feature) => feature.bucket === bucket.key)}
            onDrop={(id) => moveFeature(id, bucket.key)}
            onMove={moveFeature}
            onRemove={(id) => setFeatures((prev) => prev.filter((feature) => feature.id !== id))}
          />
        ))}
      </div>
    </StepPage>
  );
}

function BucketLane({
  config,
  features,
  onDrop,
  onMove,
  onRemove,
}: {
  config: { key: Bucket | "unassigned"; label: string; desc: string; bg: string };
  features: MoscowFeature[];
  onDrop: (id: string) => void;
  onMove: (id: string, bucket: MoscowFeature["bucket"]) => void;
  onRemove: (id: string) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`sketch-border-thin p-3 min-h-[170px] transition-all ${config.bg} ${over ? "ring-2 ring-foreground" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const id = event.dataTransfer.getData("text/plain");
        if (id) onDrop(id);
      }}
    >
      <div className="mb-3">
        <div className="font-sketch text-lg">{config.label}</div>
        <div className="font-hand text-xs text-muted-foreground">{config.desc}</div>
      </div>
      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={feature.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", feature.id)}
            className="bg-background sketch-border-thin px-3 py-2 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-start gap-2">
              <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-sketch text-sm leading-tight">{feature.name}</div>
                {feature.description && <div className="text-xs text-muted-foreground mt-1">{feature.description}</div>}
              </div>
              <button type="button" onClick={() => onRemove(feature.id)} className="text-muted-foreground hover:text-foreground p-0.5" aria-label="הסר תכונה">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {BUCKETS.filter((bucket) => bucket.key !== "unassigned").map((bucket) => (
                <button
                  key={bucket.key}
                  type="button"
                  onClick={() => onMove(feature.id, bucket.key)}
                  className={`pill-chip text-[10px] cursor-pointer ${feature.bucket === bucket.key ? "pill-chip-mint" : "pill-chip-outline"}`}
                >
                  {bucket.label.split(" — ")[0]}
                </button>
              ))}
            </div>
          </div>
        ))}
        {features.length === 0 && (
          <div className="text-xs text-muted-foreground font-hand text-center py-4 border-2 border-dashed border-foreground/15 rounded">
            גררו לכאן או בחרו קטגוריה בכרטיס
          </div>
        )}
      </div>
    </div>
  );
}