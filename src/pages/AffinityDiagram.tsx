import { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";

interface Cluster {
  label: string;
  items: string[];
}

const CLUSTER_PLACEHOLDERS = [
  "חוויית משתמש ראשונית",
  "מוטיבציה ורגשות",
  "חסמים ותסכולים",
  "דפוסי שימוש חוזרים",
  "ציפיות לא ממולאות",
];

const ITEM_PLACEHOLDERS = [
  "הבחנה שעלתה מהמחקר...",
  "משפט בולט שנאמר בראיון...",
  "דפוס שחזר אצל מספר משתמשים...",
  "תצפית מפתיעה מהשטח...",
];

const AffinityDiagram = () => {
  const { getStepData } = useProject();
  const [clusters, setClusters] = useState<Cluster[]>([
    { label: "", items: [""] },
  ]);

  useEffect(() => {
    const saved = getStepData("affinity_diagram");
    if (saved?.clusters) setClusters(saved.clusters);
  }, [getStepData]);

  const addCluster = () => setClusters([...clusters, { label: "", items: [""] }]);
  const removeCluster = (i: number) => setClusters(clusters.filter((_, idx) => idx !== i));

  const updateLabel = (i: number, label: string) => {
    const updated = [...clusters];
    updated[i] = { ...updated[i], label };
    setClusters(updated);
  };

  const addItem = (ci: number) => {
    const updated = [...clusters];
    updated[ci] = { ...updated[ci], items: [...updated[ci].items, ""] };
    setClusters(updated);
  };

  const updateItem = (ci: number, ii: number, val: string) => {
    const updated = [...clusters];
    const items = [...updated[ci].items];
    items[ii] = val;
    updated[ci] = { ...updated[ci], items };
    setClusters(updated);
  };

  const removeItem = (ci: number, ii: number) => {
    const updated = [...clusters];
    updated[ci] = { ...updated[ci], items: updated[ci].items.filter((_, idx) => idx !== ii) };
    setClusters(updated);
  };

  const getData = useCallback(() => ({ clusters }), [clusters]);

  const hasContent = clusters.some(c => c.label.trim() || c.items.some(i => i.trim()));

  return (
    <StepPage stepKey="affinity_diagram" onSave={getData} canComplete={hasContent}>
      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <p className="font-hand text-lg text-muted-foreground">
          📋 קבצו את תצפיות המחקר שלכם לנושאים. כל אשכול מייצג דפוס שזיהיתם.
        </p>
      </div>

      <div className="space-y-6">
        {clusters.map((cluster, ci) => (
          <div key={ci} className="sketch-card">
            <div className="flex items-center gap-2 mb-3">
              <input
                className="sketch-input flex-1 font-sketch text-lg"
                placeholder={CLUSTER_PLACEHOLDERS[ci % CLUSTER_PLACEHOLDERS.length]}
                value={cluster.label}
                onChange={(e) => updateLabel(ci, e.target.value)}
              />
              {clusters.length > 1 && (
                <button onClick={() => removeCluster(ci)} className="p-1 hover:bg-accent rounded-sm">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-2 mr-4">
              {cluster.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2">
                  <span className="text-muted-foreground font-hand">•</span>
                  <input
                    className="sketch-input flex-1 text-base"
                    placeholder={ITEM_PLACEHOLDERS[ii % ITEM_PLACEHOLDERS.length]}
                    value={item}
                    onChange={(e) => updateItem(ci, ii, e.target.value)}
                  />
                  {cluster.items.length > 1 && (
                    <button onClick={() => removeItem(ci, ii)} className="p-1 hover:bg-accent rounded-sm">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addItem(ci)}
                className="text-xs font-hand text-muted-foreground hover:text-foreground flex items-center gap-1 mr-4"
              >
                <Plus className="h-3 w-3" /> הוסף הערה
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addCluster} className="sketch-btn-outline mt-4 flex items-center gap-2 text-sm">
        <Plus className="h-4 w-4" /> הוסף אשכול
      </button>
    </StepPage>
  );
};

export default AffinityDiagram;