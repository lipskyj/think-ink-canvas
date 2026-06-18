import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X } from "lucide-react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";

interface Frame {
  scene: string;
  action: string;
  emotion: string;
}

const SCENE_PLACEHOLDERS = [
  "הבוקר, המשתמש מגלה את הבעיה לראשונה...",
  "המשתמש מחפש פתרון ומנסה את המוצר שלנו...",
  "המשתמש משלים את המשימה בהצלחה...",
  "המשתמש משתף את החוויה עם אחרים...",
];

const ACTION_PLACEHOLDERS = [
  "פותח את האפליקציה ומחפש...",
  "לוחץ על הכפתור הראשי ומגלה...",
  "ממלא את הטופס ושולח...",
  "חוזר להשתמש ביום למחרת...",
];

const EMOTION_PLACEHOLDERS = [
  "מבולבל ולא בטוח מה לעשות...",
  "מקווה שזה יעבוד, קצת סקפטי...",
  "מופתע ומרוצה מהתוצאה...",
  "בטוח ורוצה להמשיך...",
];

const Storyboard = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [protagonist, setProtagonist] = useState("");
  const [frames, setFrames] = useState<Frame[]>([
    { scene: "", action: "", emotion: "" },
    { scene: "", action: "", emotion: "" },
    { scene: "", action: "", emotion: "" },
  ]);

  useEffect(() => {
    const saved = getStepData("storyboard");
    if (saved?.frames) setFrames(saved.frames);
    if (saved?.protagonist) setProtagonist(saved.protagonist);
  }, [getStepData]);

  // Auto-fill protagonist from Persona
  const autoFillFields = useMemo(() => ({
    protagonist: { value: protagonist, set: setProtagonist },
  }), [protagonist]);
  useAutoFill("storyboard", autoFillFields);

  const updateFrame = (i: number, field: keyof Frame, val: string) => {
    const updated = [...frames];
    updated[i] = { ...updated[i], [field]: val };
    setFrames(updated);
  };
  const addFrame = () => setFrames([...frames, { scene: "", action: "", emotion: "" }]);
  const removeFrame = (i: number) => setFrames(frames.filter((_, idx) => idx !== i));

  const getData = useCallback(() => ({ protagonist, frames }), [protagonist, frames]);
  const hasContent = protagonist.trim() || frames.some((f) => f.scene.trim() || f.action.trim());
  const previousData = getAllPreviousData("storyboard");

  return (
    <StepPage stepKey="storyboard" onSave={getData} canComplete={!!hasContent}>
      <CoherenceTracker stepKey="storyboard" currentData={{ frames }} />

      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <p className="font-hand text-lg text-muted-foreground">
          🎬 שרטטו כיצד המשתמש מתקשר עם הפתרון שלכם, פריים אחר פריים.
        </p>
      </div>

      <div className="sketch-card mb-4">
        <div className="flex items-center relative">
          <label className="font-semibold text-sm block mb-2">👤 גיבור הסיפור</label>
          <SectionHelper stepKey="storyboard" sectionKey="protagonist" currentData={{ protagonist, frames }} previousData={previousData} onApply={(v) => setProtagonist(v)} />
        </div>
        <input className="sketch-input" placeholder="שם הפרסונה שמככבת בסטוריבורד..." value={protagonist} onChange={(e) => setProtagonist(e.target.value)} />
      </div>

      <div className="space-y-4">
        {frames.map((frame, i) => (
          <div key={i} className="sketch-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center relative">
                <h3 className="font-sketch text-lg">פריים {i + 1}</h3>
                <SectionHelper stepKey="storyboard" sectionKey="frame" currentData={{ frames, currentFrame: i }} previousData={previousData} onApply={(v) => updateFrame(i, "scene", v)} />
              </div>
              {frames.length > 1 && (
                <button onClick={() => removeFrame(i)} className="p-1 hover:bg-accent rounded-sm">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs text-muted-foreground block mb-1">🖼️ סצנה</label>
                  <SectionHelper stepKey="storyboard" sectionKey="scene" currentData={{ frames, currentFrame: i }} previousData={previousData} onApply={(v) => updateFrame(i, "scene", v)} />
                </div>
                <input className="sketch-input" placeholder={SCENE_PLACEHOLDERS[i % SCENE_PLACEHOLDERS.length]} value={frame.scene} onChange={(e) => updateFrame(i, "scene", e.target.value)} />
              </div>
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs text-muted-foreground block mb-1">🖐️ פעולה</label>
                  <SectionHelper stepKey="storyboard" sectionKey="frameAction" currentData={{ frames, currentFrame: i }} previousData={previousData} onApply={(v) => updateFrame(i, "action", v)} />
                </div>
                <input className="sketch-input" placeholder={ACTION_PLACEHOLDERS[i % ACTION_PLACEHOLDERS.length]} value={frame.action} onChange={(e) => updateFrame(i, "action", e.target.value)} />
              </div>
              <div>
                <div className="flex items-center relative">
                  <label className="font-sketch text-xs text-muted-foreground block mb-1">💭 רגש</label>
                  <SectionHelper stepKey="storyboard" sectionKey="frameEmotion" currentData={{ frames, currentFrame: i }} previousData={previousData} />
                </div>
                <input className="sketch-input" placeholder={EMOTION_PLACEHOLDERS[i % EMOTION_PLACEHOLDERS.length]} value={frame.emotion} onChange={(e) => updateFrame(i, "emotion", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addFrame} className="sketch-btn-outline mt-4 flex items-center gap-2 text-sm">
        <Plus className="h-4 w-4" /> הוסף פריים
      </button>
    </StepPage>
  );
};

export default Storyboard;