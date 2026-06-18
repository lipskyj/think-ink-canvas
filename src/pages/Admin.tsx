import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import { STEPS, PHASES, getStepByKey } from "@/lib/steps";
import { Switch } from "@/components/ui/switch";
import {
  Lock, Unlock, Sparkles, Shield, LockOpen, Plus, Trash2, Copy, Users, Check,
  ChevronDown, ChevronUp, Eye, Settings, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useClass } from "@/contexts/ClassContext";
import { Navigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClassRow {
  id: string;
  name: string;
  student_names: string[];
  ai_enabled: boolean;
  locked_steps: Record<string, boolean>;
  created_at: string;
  leader_name: string | null;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  event_topic: string | null;
  event_description: string | null;
  organizer_logo_url: string | null;
  join_code: string | null;
}

interface StudentProgress {
  student_name: string;
  steps: Record<string, { completed: boolean; data: any }>;
}

export default function Admin() {
  const { isClassMode } = useClass();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newStudentNames, setNewStudentNames] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState({
    event_topic: "",
    event_description: "",
    event_date: "",
    event_time: "",
    event_location: "",
    organizer_logo_url: "",
  });
  const eventDraftHydrated = useRef(false);

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from("classes").select("*").order("created_at", { ascending: false });
    setClasses(
      (data || []).map((d: any) => ({
        ...d,
        locked_steps: (d.locked_steps as Record<string, boolean>) ?? {},
      }))
    );
    setLoadingClasses(false);
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  useEffect(() => {
    if (!classes.length) return;
    if (eventDraftHydrated.current) return;
    const source = classes.find((cls) => cls.event_topic || cls.event_description || cls.event_date || cls.event_time || cls.event_location || cls.organizer_logo_url) || classes[0];
    eventDraftHydrated.current = true;
    setEventDraft({
      event_topic: source.event_topic || "",
      event_description: source.event_description || "",
      event_date: source.event_date || "",
      event_time: source.event_time || "",
      event_location: source.event_location || "",
      organizer_logo_url: source.organizer_logo_url || "",
    });
  }, [classes]);

  // Students in class mode cannot access admin
  if (isClassMode) {
    return <Navigate to="/" replace />;
  }

  const createClass = async () => {
    // Name is optional — team will rename themselves. Use a placeholder; we'll update it to the join code after insert.
    const { data, error } = await supabase
      .from("classes")
      .insert({
        name: newClassName.trim() || "קבוצה חדשה",
        student_names: [],
        event_topic: eventDraft.event_topic || null,
        event_description: eventDraft.event_description || null,
        event_date: eventDraft.event_date || null,
        event_time: eventDraft.event_time || null,
        event_location: eventDraft.event_location || null,
        organizer_logo_url: eventDraft.organizer_logo_url || null,
      })
      .select("id, join_code")
      .single();
    if (error || !data) {
      toast({ title: "שגיאה", description: error?.message || "", variant: "destructive" });
      return;
    }
    // If admin didn't provide a name, default to the join code so it's identifiable.
    if (!newClassName.trim() && data.join_code) {
      await supabase.from("classes").update({ name: `קבוצה ${data.join_code}` }).eq("id", data.id);
    }
    toast({ title: "הקבוצה נוצרה" });
    setNewClassName("");
    setNewStudentNames("");
    fetchClasses();
  };

  const deleteClass = async (id: string) => {
    await supabase.from("classes").delete().eq("id", id);
    toast({ title: "הכיתה נמחקה" });
    fetchClasses();
  };

  const copyLink = (id: string) => {
    // Always use the published URL so students can access without Lovable login
    const publishedOrigin = "https://inkwell-thinking-studio.lovable.app";
    const currentOrigin = window.location.origin;
    const isDevEnvironment = currentOrigin.includes("lovableproject.com") || currentOrigin.includes("lovable.app/");
    // Always prefer published URL unless already on it
    const origin = currentOrigin === publishedOrigin ? currentOrigin : publishedOrigin;
    const url = `${origin}/join/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "הקישור הועתק " });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateClass = async (id: string, updates: Partial<ClassRow>) => {
    const dbUpdates: any = {};
    const allowed: (keyof ClassRow)[] = [
      "student_names","ai_enabled","locked_steps","name","leader_name",
      "event_date","event_time","event_location","event_topic",
      "event_description","organizer_logo_url",
    ];
    for (const k of allowed) {
      if (updates[k] !== undefined) dbUpdates[k] = updates[k] as any;
    }
    const { error } = await supabase.from("classes").update(dbUpdates).eq("id", id);
    if (error) {
      toast({ title: "שגיאה בעדכון", description: error.message, variant: "destructive" });
    }
    await fetchClasses();
  };

  const updateEventForAllGroups = async (updates: Partial<ClassRow>) => {
    setEventDraft((prev) => ({ ...prev, ...(updates as any) }));
    if (classes.length === 0) return;
    const dbUpdates = Object.fromEntries(Object.entries(updates).map(([key, value]) => [key, value || null]));
    const { error } = await supabase.from("classes").update(dbUpdates).in("id", classes.map((cls) => cls.id));
    if (error) {
      toast({ title: "שגיאה בעדכון פרטי האירוע", description: error.message, variant: "destructive" });
      return;
    }
    await fetchClasses();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="display-huge mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8" /> ניהול האירוע
        </h1>
        <p className="font-hand text-lg text-muted-foreground mb-8">
          הגדירו את פרטי האירוע, צרו קבוצות, ושלחו לתלמידים קישור הצטרפות.
        </p>

        {/* Create new group */}
        <div className="sketch-card mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-5 w-5" />
            <h2 className="font-sketch text-lg">קבוצה חדשה</h2>
          </div>
          <p className="text-xs text-muted-foreground font-hand mb-3">
            לא צריך לתת שם — המערכת תיצור קוד הצטרפות (כמו A6) והקבוצה תבחר לעצמה שם בהמשך.
          </p>
          <button onClick={createClass} className="sketch-btn flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> צור קבוצה
          </button>
        </div>

        {/* Classes list */}
        {loadingClasses ? (
          <p className="text-sm text-muted-foreground">טוען כיתות...</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין כיתות עדיין</p>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => (
              <ClassPanel
                key={cls.id}
                cls={cls}
                copiedId={copiedId}
                expanded={expandedClass === cls.id}
                onToggleExpand={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                onCopyLink={copyLink}
                onDelete={deleteClass}
                onUpdate={updateClass}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ─── Class Panel ─── */
function ClassPanel({
  cls,
  copiedId,
  expanded,
  onToggleExpand,
  onCopyLink,
  onDelete,
  onUpdate,
}: {
  cls: ClassRow;
  copiedId: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onCopyLink: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ClassRow>) => void;
}) {
  const [tab, setTab] = useState<"settings" | "progress" | "students">("settings");
  const [editingNames, setEditingNames] = useState(false);
  const [editNames, setEditNames] = useState(cls.student_names.join("\n"));
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [viewingWork, setViewingWork] = useState<{ studentName: string; stepKey: string; data: any } | null>(null);

  const fetchProgress = useCallback(async () => {
    setLoadingProgress(true);
    const { data } = await supabase
      .from("class_step_data")
      .select("student_name, step_key, completed, data")
      .eq("class_id", cls.id);

    const map: Record<string, StudentProgress> = {};
    cls.student_names.forEach((name) => {
      map[name] = { student_name: name, steps: {} };
    });
    (data || []).forEach((row: any) => {
      if (!map[row.student_name]) {
        map[row.student_name] = { student_name: row.student_name, steps: {} };
      }
      map[row.student_name].steps[row.step_key] = { completed: row.completed, data: row.data };
    });
    setProgress(Object.values(map));
    setLoadingProgress(false);
  }, [cls.id, cls.student_names]);

  useEffect(() => {
    if (expanded && tab === "progress") fetchProgress();
  }, [expanded, tab, fetchProgress]);

  const [updating, setUpdating] = useState(false);

  const safeUpdate = async (updates: Partial<ClassRow>) => {
    if (updating) return;
    setUpdating(true);
    await onUpdate(cls.id, updates);
    setUpdating(false);
  };

  const toggleAI = () => safeUpdate({ ai_enabled: !cls.ai_enabled });

  const toggleStepLock = (stepKey: string) => {
    const next = { ...cls.locked_steps, [stepKey]: !cls.locked_steps[stepKey] };
    safeUpdate({ locked_steps: next });
  };

  const lockAll = () => {
    const locked: Record<string, boolean> = {};
    STEPS.forEach((s) => { locked[s.key] = true; });
    safeUpdate({ locked_steps: locked });
  };

  const unlockAll = () => safeUpdate({ locked_steps: {} });

  const saveNames = () => {
    const names = editNames.split("\n").map((n) => n.trim()).filter(Boolean);
    onUpdate(cls.id, { student_names: names });
    setEditingNames(false);
  };

  // Human-readable labels for data fields
  const fieldLabels: Record<string, string> = {
    // Empathy Map
    userDesc: "תיאור המשתמש",
    quadrants: "רבעים",
    says: "אומר",
    thinks: "חושב",
    feels: "מרגיש",
    does: "עושה",
    // POV
    user: "משתמש",
    need: "צורך",
    insight: "תובנה",
    // Converge
    clusters: "אשכולות",
    theme: "נושא",
    notes: "הערות",
    quadrant: "רבע",
    gaps: "פערים",
    insights: "תובנות",
    because: "כי",
    despite: "למרות ש",
    therefore: "לכן",
    interventions: "התערבויות",
    interventionRationale: "נימוק להתערבות",
    outliers: "חריגים",
    problemNotes: "הערות לבעיה",
    problemTypes: "סוגי בעיות",
    repeatedThemes: "נושאים חוזרים",
    hmws: "איך נוכל",
    // JTBD
    mainJob: "המשימה העיקרית",
    constraints: "אילוצים",
    jobs: "משימות",
    situation: "מצב",
    motivation: "מוטיבציה",
    outcome: "תוצאה רצויה",
    functional: "פונקציונלי",
    emotional: "רגשי",
    social: "חברתי",
    // Persona
    name: "שם",
    age: "גיל",
    occupation: "תפקיד",
    bio: "רקע",
    goals: "מטרות",
    frustrations: "תסכולים",
    quote: "ציטוט",
    // HMW
    hmwStatements: "שאלות ״איך נוכל״",
    selectedHmw: "שאלה שנבחרה",
    // Ideation
    ideas: "רעיונות",
    selectedIdea: "רעיון שנבחר",
    ideaTitle: "כותרת הרעיון",
    ideaDescription: "תיאור הרעיון",
    text: "תוכן",
    method: "שיטה",
    starred: "מסומן",
    // Assumptions
    assumptions: "הנחות",
    selectedAssumptions: "הנחות שנבחרו",
    // Five Whys
    problem: "בעיה",
    whys: "למה?",
    rootCause: "שורש הבעיה",
    // Journey Map
    stages: "שלבים",
    touchpoints: "נקודות מגע",
    emotions: "רגשות",
    painPoints: "נקודות כאב",
    opportunities: "הזדמנויות",
    // Storyboard
    scenes: "סצנות",
    description: "תיאור",
    // Prototype Brief
    featureList: "רשימת פיצ'רים",
    userFlow: "זרימת משתמש",
    // User Testing
    tasks: "משימות לבדיקה",
    findings: "ממצאים",
    feedback: "משוב",
    // PRD Generator
    prdOutput: "פרומפט PRD שנוצר",
    additionalNotes: "הערות נוספות",
  };

  const getLabel = (key: string): string => fieldLabels[key] || key;

  const methodLabels: Record<string, string> = {
    worst_ideas: "הרעיונות הכי גרועים",
    no_budget: "בלי הגבלת תקציב",
    copy_improve: "העתק ושפר",
    rapid_fire: "ירי מהיר",
    reverse: "הפוך על הפוך",
  };

  const renderIdeaItem = (item: any, i: number): React.ReactNode => {
    if (!item || typeof item !== "object") return <span className="font-hand text-sm">• {String(item)}</span>;
    const text = item.text || "";
    const method = item.method ? (methodLabels[item.method] || item.method) : "";
    const starred = item.starred === true;
    if (!text) return null;
    return (
      <div key={i} className={`sketch-border-thin p-2 rounded-sm mb-1 flex items-start gap-2 ${starred ? "bg-yellow-100/60 dark:bg-yellow-900/20 border-yellow-400/50" : "bg-secondary/10"}`}>
        {starred && <span className="text-yellow-500 mt-0.5"></span>}
        <div className="flex-1 min-w-0">
          <p className="font-hand text-sm whitespace-pre-wrap">{text}</p>
          {method && <span className="font-sketch text-xs text-muted-foreground">{method}</span>}
        </div>
      </div>
    );
  };

  const renderValue = (value: any, depth = 0, fieldKey?: string): React.ReactNode => {
    if (value === null || value === undefined || value === "") return <span className="text-muted-foreground/50 italic">—</span>;
    if (typeof value === "string") return <p className="font-hand text-sm whitespace-pre-wrap">{value}</p>;
    if (typeof value === "number") return <p className="font-hand text-sm">{String(value)}</p>;
    if (typeof value === "boolean") return <p className="font-hand text-sm">{value ? "כן " : "לא"}</p>;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground/50 italic">—</span>;
      // Special rendering for ideation ideas array
      if (fieldKey === "ideas" && value.length > 0 && value[0]?.text !== undefined) {
        const starredIdeas = value.filter((item) => item.starred);
        const otherIdeas = value.filter((item) => !item.starred);
        return (
          <div className="space-y-1">
            {starredIdeas.length > 0 && (
              <div className="mb-2">
                <p className="font-sketch text-xs text-yellow-600 dark:text-yellow-400 mb-1"> רעיונות מסומנים ({starredIdeas.length})</p>
                {starredIdeas.map((item, i) => renderIdeaItem(item, i))}
              </div>
            )}
            {otherIdeas.map((item, i) => renderIdeaItem(item, starredIdeas.length + i))}
          </div>
        );
      }
      return (
        <ul className={`space-y-1 ${depth > 0 ? "mr-3" : ""}`}>
          {value.map((item, i) => (
            <li key={i}>
              {typeof item === "object" && item !== null ? (
                <div className="sketch-border-thin p-2 bg-secondary/10 rounded-sm mb-1">
                  {Object.entries(item).filter(([k]) => k !== "id").map(([k, v]) => {
                    const val = v as any;
                    if (val === null || val === undefined || val === "") return null;
                    return (
                      <div key={k} className="mb-1">
                        <span className="font-sketch text-xs text-muted-foreground">{getLabel(k)}: </span>
                        <span className="font-hand text-sm">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="font-hand text-sm">• {String(item)}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof value === "object") {
      const entries = Object.entries(value).filter(([k]) => k !== "id");
      if (entries.length === 0) return <span className="text-muted-foreground/50 italic">—</span>;
      return (
        <div className={`space-y-2 ${depth > 0 ? "mr-3" : ""}`}>
          {entries.map(([k, v]) => {
            const val = v as any;
            if (val === null || val === undefined || val === "") return null;
            return (
              <div key={k} className="sketch-border-thin p-3 bg-secondary/20 rounded-sm">
                <p className="font-sketch text-xs text-muted-foreground mb-1">{getLabel(k)}</p>
                {renderValue(val, depth + 1, k)}
              </div>
            );
          })}
        </div>
      );
    }
    return <p className="font-hand text-sm">{String(value)}</p>;
  };

  const renderStudentData = (data: any) => {
    if (!data || typeof data !== "object") return null;
    return Object.entries(data).filter(([k]) => k !== "id").map(([key, value]) => {
      const val = value as any;
      if (val === null || val === undefined || val === "") return null;
      return (
        <div key={key} className="sketch-border-thin p-3 bg-secondary/20 rounded-sm">
          <p className="font-sketch text-xs text-muted-foreground mb-1">{getLabel(key)}</p>
          {renderValue(val, 0, key)}
        </div>
      );
    });
  };

  return (
    <div className="sketch-card">
      {/* Header */}
      <div className="flex items-center justify-between cursor-pointer gap-3" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 min-w-0">
          {cls.join_code && (
            <div className="sketch-border-thin bg-yellow-100/60 dark:bg-yellow-900/30 px-3 py-2 rounded-md shrink-0">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-sketch">קוד</div>
              <div className="font-sketch text-2xl tracking-widest leading-none">{cls.join_code}</div>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-sketch text-lg truncate">{cls.name}</h3>
            <p className="text-xs text-muted-foreground">{cls.student_names.length} סטודנטים</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onCopyLink(cls.id); }}
            className="sketch-btn-outline text-xs flex items-center gap-1 px-2 py-1"
            title="העתק קישור הצטרפות ישיר"
          >
            {copiedId === cls.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedId === cls.id ? "הועתק!" : "קישור"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(cls.id); }}
            className="sketch-btn-outline text-xs flex items-center gap-1 px-2 py-1 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "settings" as const, label: "הגדרות", icon: Settings },
              { key: "progress" as const, label: "התקדמות", icon: Eye },
              { key: "students" as const, label: "סטודנטים", icon: Users },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-sm transition-colors ${
                  tab === t.key ? "bg-foreground text-primary-foreground" : "bg-secondary hover:bg-secondary/70"
                }`}
              >
                <t.icon className="h-3 w-3" /> {t.label}
              </button>
            ))}
          </div>

          {/* Settings tab */}
          {tab === "settings" && (
            <div className="space-y-4">
              {/* Event details */}
              <div className="sketch-border-thin p-3 space-y-2">
                <p className="font-sketch text-xs uppercase tracking-wider text-muted-foreground">פרטי האירוע</p>
                <Input
                  placeholder="נושא / אתגר (למשל: בריאות נפש בנוער)"
                  defaultValue={cls.event_topic || ""}
                  onBlur={(e) => e.target.value !== (cls.event_topic || "") && onUpdate(cls.id, { event_topic: e.target.value })}
                />
                <Textarea
                  placeholder="תיאור / רקע על האירוע (יוצג בדף הבית של המשתתפים)"
                  defaultValue={cls.event_description || ""}
                  rows={3}
                  className="text-sm"
                  onBlur={(e) => e.target.value !== (cls.event_description || "") && onUpdate(cls.id, { event_description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="תאריך"
                    defaultValue={cls.event_date || ""}
                    onBlur={(e) => e.target.value !== (cls.event_date || "") && onUpdate(cls.id, { event_date: e.target.value })}
                  />
                  <Input
                    placeholder="שעה"
                    defaultValue={cls.event_time || ""}
                    onBlur={(e) => e.target.value !== (cls.event_time || "") && onUpdate(cls.id, { event_time: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="בית ספר / עיר / מיקום"
                  defaultValue={cls.event_location || ""}
                  onBlur={(e) => e.target.value !== (cls.event_location || "") && onUpdate(cls.id, { event_location: e.target.value })}
                />

                {/* Organizer logo upload */}
                <div className="pt-2">
                  <p className="text-xs font-sketch uppercase tracking-wider text-muted-foreground mb-1">לוגו המארגן</p>
                  <div className="flex items-center gap-3">
                    {cls.organizer_logo_url ? (
                      <img src={cls.organizer_logo_url} alt="לוגו" className="h-12 max-w-[100px] object-contain sketch-border-thin bg-background p-1 rounded" />
                    ) : (
                      <div className="h-12 w-12 sketch-border-thin rounded flex items-center justify-center text-muted-foreground text-[10px] font-hand">ללא</div>
                    )}
                    <label className="sketch-btn-outline text-xs cursor-pointer px-2 py-1">
                      העלה תמונה
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1024 * 1024) {
                            alert("גודל מקסימלי: 1MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            onUpdate(cls.id, { organizer_logo_url: String(reader.result) });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {cls.organizer_logo_url && (
                      <button
                        onClick={() => onUpdate(cls.id, { organizer_logo_url: null as any })}
                        className="text-xs text-destructive underline"
                      >
                        הסר
                      </button>
                    )}
                  </div>
                </div>

                {cls.leader_name && (
                  <p className="text-xs font-hand text-muted-foreground pt-1">
                    ראש קבוצה: <strong>{cls.leader_name}</strong>
                    <button
                      onClick={() => onUpdate(cls.id, { leader_name: null as any })}
                      className="mr-2 text-destructive underline"
                    >
                      איפוס
                    </button>
                  </p>
                )}
              </div>

              {/* AI toggle */}
              <div className="flex items-center justify-between py-3 px-3 rounded-md bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-sketch text-sm">סיוע AI</span>
                </div>
                <button
                  onClick={toggleAI}
                  disabled={updating}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sketch transition-all ${
                    cls.ai_enabled
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground border border-border"
                  } ${updating ? "opacity-50" : ""}`}
                >
                  {cls.ai_enabled ? (
                    <><Sparkles className="h-3 w-3" /> פעיל</>
                  ) : (
                    <><X className="h-3 w-3" /> כבוי</>
                  )}
                </button>
              </div>

              {/* Step locking */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="font-sketch text-sm">נעילת שלבים</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={lockAll} className="sketch-btn-outline text-[10px] px-2 py-0.5 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> נעל הכל
                    </button>
                    <button onClick={unlockAll} className="sketch-btn-outline text-[10px] px-2 py-0.5 flex items-center gap-1">
                      <LockOpen className="h-2.5 w-2.5" /> פתח הכל
                    </button>
                  </div>
                </div>
                {PHASES.map((phase) => {
                  const phaseSteps = STEPS.filter((s) => s.phase === phase.key);
                  return (
                    <div key={phase.key} className="mb-2">
                      <p className="text-[10px] text-muted-foreground font-sketch uppercase tracking-wider mb-1">
                        {phase.emoji} {phase.title}
                      </p>
                {phaseSteps.map((step) => {
                        const locked = cls.locked_steps[step.key] === true;
                        const Icon = step.icon;
                        return (
                          <div key={step.key} className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <Icon className="h-3.5 w-3.5" />
                              <span className="font-sketch text-xs">{step.num}. {step.title}</span>
                            </div>
                            <button
                              onClick={() => toggleStepLock(step.key)}
                              disabled={updating}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-sketch transition-all ${
                                locked
                                  ? "bg-destructive/15 text-destructive border border-destructive/30"
                                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                              } ${updating ? "opacity-50" : ""}`}
                            >
                              {locked ? (
                                <><Lock className="h-2.5 w-2.5" /> נעול</>
                              ) : (
                                <><Unlock className="h-2.5 w-2.5" /> פתוח</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress tab */}
          {tab === "progress" && (
            <div>
              {loadingProgress ? (
                <p className="text-sm text-muted-foreground">טוען...</p>
              ) : progress.length === 0 ? (
                <p className="text-sm text-muted-foreground">אין נתונים עדיין</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right font-sketch py-2 px-1 sticky right-0 bg-card">סטודנט/ית</th>
                        {STEPS.map((step) => (
                          <th key={step.key} className="py-2 px-1 text-center font-sketch whitespace-nowrap">
                            {step.num}
                          </th>
                        ))}
                        <th className="py-2 px-1 text-center font-sketch">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.map((sp) => {
                        const completedCount = STEPS.filter((s) => sp.steps[s.key]?.completed).length;
                        const hasDataCount = STEPS.filter((s) => sp.steps[s.key]?.data && Object.keys(sp.steps[s.key].data).length > 0).length;
                        const pct = Math.round((completedCount / STEPS.length) * 100);
                        return (
                          <tr key={sp.student_name} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="py-2 px-1 font-sketch sticky right-0 bg-card whitespace-nowrap">{sp.student_name}</td>
                            {STEPS.map((step) => {
                              const stepProgress = sp.steps[step.key];
                              const completed = stepProgress?.completed;
                              const hasData = stepProgress?.data && Object.keys(stepProgress.data).length > 0;
                              return (
                                <td key={step.key} className="py-2 px-1 text-center">
                                  {completed || hasData ? (
                                    <button
                                      onClick={() => setViewingWork({ studentName: sp.student_name, stepKey: step.key, data: stepProgress?.data })}
                                      className="hover:bg-secondary rounded px-1 transition-colors"
                                      title="לחצו לצפייה בתוכן"
                                    >
                                      {completed ? (
                                        <span className="text-foreground font-bold"></span>
                                      ) : (
                                        <span className="text-muted-foreground">◐</span>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="text-muted-foreground/40">·</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-2 px-1 text-center font-sketch">
                              <span className={pct === 100 ? "text-foreground font-bold" : pct > 0 ? "text-muted-foreground" : "text-muted-foreground/50"}>
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Step number legend */}
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                    {STEPS.map((s) => (
                      <span key={s.key}>{s.num}={s.title}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                    <span> = הושלם</span>
                    <span>◐ = בתהליך</span>
                    <span>· = טרם התחיל</span>
                  </div>
                </div>
              )}
              <button onClick={fetchProgress} className="mt-3 sketch-btn-outline text-xs flex items-center gap-1 px-2 py-1">
                רענן נתונים
              </button>

              {/* Student work viewer dialog */}
              <Dialog open={!!viewingWork} onOpenChange={(open) => !open && setViewingWork(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-sketch text-lg">
                      {viewingWork && getStepByKey(viewingWork.stepKey)?.title} — {viewingWork?.studentName}
                    </DialogTitle>
                  </DialogHeader>
                  {viewingWork?.data && (
                    <div className="space-y-3 text-sm">
                      {renderStudentData(viewingWork.data)}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Students tab */}
          {tab === "students" && (
            <div>
              {editingNames ? (
                <div>
                  <Textarea
                    value={editNames}
                    onChange={(e) => setEditNames(e.target.value)}
                    rows={6}
                    className="text-sm mb-2"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveNames} className="sketch-btn text-xs px-3 py-1">שמור</button>
                    <button onClick={() => setEditingNames(false)} className="sketch-btn-outline text-xs px-3 py-1">ביטול</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cls.student_names.map((name) => (
                      <span key={name} className="text-xs bg-secondary px-2 py-1 rounded-sm">{name}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => { setEditNames(cls.student_names.join("\n")); setEditingNames(true); }}
                    className="sketch-btn-outline text-xs px-3 py-1"
                  >
                    ערוך שמות
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
