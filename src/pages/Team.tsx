import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useClass } from "@/contexts/ClassContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Sparkles, Loader2, Plus, X, Crown, ArrowRight, RefreshCw, Save, Check } from "lucide-react";
import { TEAM_AVATAR_STYLES, type TeamAvatarStyleKey, getAvatarStyle } from "@/lib/teamAvatarStyles";

type Gender = "male" | "female" | "other";
interface Member { name: string; gender: Gender }

const SITUATION_PRESETS = [
  "עומדים יחד וצוחקים",
  "רוקדים במסיבה",
  "על החוף בשקיעה",
  "במעבדה בונים פרוטוטייפ",
  "במגרש כדורסל",
  "בפיקניק בפארק",
];

export default function Team() {
  const { session, isClassMode, isLeader, setSession } = useClass();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [situation, setSituation] = useState("");
  const [styleKey, setStyleKey] = useState<TeamAvatarStyleKey>("noam");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!isClassMode || !session) return;
    supabase
      .from("classes")
      .select("name, student_names, team_avatar_url, team_avatar_prompt")
      .eq("id", session.classId)
      .single()
      .then(({ data }) => {
        if (data) {
          setTeamName(data.name || "");
          const names = (data.student_names as string[]) || [];
          setMembers(
            names.length
              ? names.map((n) => ({ name: n, gender: "other" as Gender }))
              : [{ name: "", gender: "other" }],
          );
          setAvatarUrl(data.team_avatar_url || null);
        }
        setLoading(false);
      });
  }, [isClassMode, session]);

  if (!isClassMode || !session) return <Navigate to="/" replace />;

  const addMember = () => setMembers([...members, { name: "", gender: "other" }]);
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));
  const updateMember = (i: number, patch: Partial<Member>) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const lastGenAt = (typeof window !== "undefined")
    ? Number(window.sessionStorage.getItem("avatar:lastGen") || 0)
    : 0;
  const generate = async () => {
    const now = Date.now();
    if (now - lastGenAt < 5000) {
      toast({ title: "רגע אחד...", description: "אפשר ליצור אווטאר חדש כל 5 שניות" });
      return;
    }
    window.sessionStorage.setItem("avatar:lastGen", String(now));
    setGenerating(true);
    setPendingAvatar(null);
    const timeout = setTimeout(() => {
      setGenerating(false);
      toast({ title: "האווטאר לוקח יותר מדי זמן", description: "נסו שוב בעוד רגע", variant: "destructive" });
    }, 30000);
    try {
      const { data, error } = await supabase.functions.invoke("generate-team-avatar", {
        body: {
          teamName,
          members: members.filter((m) => m.name.trim() || m.gender),
          situation,
          stylePrompt: getAvatarStyle(styleKey).prompt,
        },
      });
      clearTimeout(timeout);
      if (error) throw error;
      if (data?.dataUrl) {
        setPendingAvatar(data.dataUrl);
        toast({ title: "האווטאר מוכן", description: "לחצו שמור כדי שיופיע בדף הבית" });
      } else {
        throw new Error("לא הוחזרה תמונה");
      }
    } catch (e: any) {
      clearTimeout(timeout);
      toast({ title: "שגיאה ביצירת אווטאר", description: e.message || String(e), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const saveAll = async () => {
    if (!isLeader) {
      toast({ title: "רק ראש הקבוצה יכול לשמור", variant: "destructive" });
      return;
    }
    setSaving(true);
    const studentNames = members.map((m) => m.name.trim()).filter(Boolean);
    const updates: any = {
      name: teamName.trim() || session.className,
      student_names: studentNames,
    };
    if (pendingAvatar) {
      updates.team_avatar_url = pendingAvatar;
      updates.team_avatar_prompt = situation;
    }
    const { error } = await supabase.from("classes").update(updates).eq("id", session.classId);
    setSaving(false);
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
      return;
    }
    if (pendingAvatar) {
      setAvatarUrl(pendingAvatar);
      setPendingAvatar(null);
    }
    setSession({ ...session, className: updates.name });
    window.dispatchEvent(new CustomEvent("classes:changed"));
    toast({ title: "נשמר!" });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  // First-time identity gate — figure out who the user is in this group
  if (!session.studentName) {
    return <IdentityGate />;
  }


  const previewSrc = pendingAvatar || avatarUrl;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-16">
        <div className="mb-6">
          <span className="pill-chip pill-chip-mint mb-3 inline-block">הקבוצה שלכם</span>
          <h1 className="display-huge leading-tight mb-2">תכירו את עצמכם</h1>
          <p className="font-hand text-lg text-muted-foreground">
            תנו לקבוצה שם, הוסיפו חברים, ויצרו אווטאר משותף בסגנון של נועם.
          </p>
        </div>

        {/* Team name + members */}
        <div className="sketch-card mb-4 space-y-4">
          <div>
            <label className="font-sketch text-xs uppercase tracking-wider block mb-1">שם הקבוצה</label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={!isLeader}
              dir="rtl"
              placeholder="למשל: צוות סופרנובה"
            />
            {!isLeader && (
              <p className="text-xs text-muted-foreground font-hand mt-1">
                רק ראש הקבוצה יכול לערוך את השם.
              </p>
            )}
          </div>

          <div>
            <label className="font-sketch text-xs uppercase tracking-wider block mb-2">חברי הקבוצה</label>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={m.name}
                    onChange={(e) => updateMember(i, { name: e.target.value })}
                    placeholder="שם"
                    dir="rtl"
                    className="flex-1"
                  />
                  <select
                    value={m.gender}
                    onChange={(e) => updateMember(i, { gender: e.target.value as Gender })}
                    className="sketch-border-thin bg-background text-sm px-2 py-2 rounded-md"
                    dir="rtl"
                  >
                    <option value="male">בן</option>
                    <option value="female">בת</option>
                    <option value="other">אחר</option>
                  </select>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="הסר"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMember}
                className="sketch-btn-outline text-xs flex items-center gap-1 px-2 py-1"
              >
                <Plus className="h-3 w-3" /> הוסף חבר/ה
              </button>
            </div>
          </div>
        </div>

        {/* Avatar generator */}
        <div className="sketch-card mb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="font-sketch text-lg">אווטאר הקבוצה</h2>
          </div>

          <div>
            <label className="font-sketch text-xs uppercase tracking-wider block mb-2">סגנון ויזואלי</label>
            <p className="font-hand text-sm text-muted-foreground mb-3">
              בחרו איך הקבוצה תיראה. כל סגנון מציג דוגמה אמיתית.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {TEAM_AVATAR_STYLES.map((s) => {
                const selected = styleKey === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStyleKey(s.key)}
                    title={`${s.label} — ${s.description}`}
                    aria-label={s.label}
                    className={`group relative overflow-hidden sketch-border-thin rounded-md transition-all ${
                      selected ? "ring-2 ring-foreground scale-[1.03]" : "hover:scale-[1.02] opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-secondary/30">
                      <img
                        src={s.sample}
                        alt={s.label}
                        loading="lazy"
                        width={512}
                        height={512}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selected && (
                      <div className="absolute top-1.5 left-1.5 bg-foreground text-background rounded-full p-1">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="font-hand text-xs text-muted-foreground mt-2 text-center">
              סגנון נבחר: <strong className="font-sketch">{getAvatarStyle(styleKey).label}</strong> — {getAvatarStyle(styleKey).description}
            </p>
          </div>




          <div>
            <label className="font-sketch text-xs uppercase tracking-wider block mb-2">מה הקבוצה עושה?</label>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="סיטואציה לאווטאר">
              {SITUATION_PRESETS.map((s) => {
                const selected = situation === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSituation(s)}
                    className={`pill-chip text-xs cursor-pointer transition ${
                      selected ? "pill-chip-coral ring-2 ring-foreground" : "pill-chip-outline opacity-80 hover:opacity-100"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="sketch-btn flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> מצייר...</>
            ) : previewSrc ? (
              <><RefreshCw className="h-4 w-4" /> צייר מחדש</>
            ) : (
              <><Sparkles className="h-4 w-4" /> צייר אווטאר</>
            )}
          </button>

          {previewSrc && (
            <div className="sketch-border-thin p-3 rounded-md bg-background">
              <img
                src={previewSrc}
                alt="אווטאר הקבוצה"
                className="w-full max-w-md mx-auto block"
              />
              {pendingAvatar && (
                <div className="text-center mt-3 space-y-2">
                  <p className="text-xs font-hand text-muted-foreground">
                    טיוטה — לחצו "שמור" כדי להציג בדף הבית
                  </p>
                  {isLeader && (
                    <button
                      type="button"
                      onClick={saveAll}
                      disabled={saving}
                      className="sketch-btn text-sm inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      שמור אווטאר לדף הבית
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="sketch-btn-outline text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4" /> חזרה
          </Link>
          {isLeader && (
            <button
              onClick={saveAll}
              disabled={saving}
              className="sketch-btn text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              שמור
            </button>
          )}
        </div>

        {isLeader && (
          <p className="text-xs font-hand text-muted-foreground mt-3 flex items-center gap-1">
            <Crown className="h-3 w-3" /> אתם ראש הקבוצה — השינויים שלכם משפיעים על כולם.
          </p>
        )}
      </div>
    </Layout>
  );
}

/** Inline name-entry step shown the first time a user lands in a class. */
function IdentityGate() {
  const { session, setSession } = useClass();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!session) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    const { data: cls, error: fetchErr } = await supabase
      .from("classes")
      .select("student_names, leader_name")
      .eq("id", session.classId)
      .single();
    if (fetchErr || !cls) {
      toast({ title: "שגיאה", description: fetchErr?.message || "", variant: "destructive" });
      setBusy(false);
      return;
    }
    const roster: string[] = cls.student_names || [];
    const willBeLeader = !cls.leader_name;
    const updates: any = {};
    if (!roster.includes(trimmed)) updates.student_names = [...roster, trimmed];
    if (willBeLeader) updates.leader_name = trimmed;
    if (Object.keys(updates).length) {
      const { error } = await supabase.from("classes").update(updates).eq("id", session.classId);
      if (error) {
        toast({ title: "שגיאה", description: error.message, variant: "destructive" });
        setBusy(false);
        return;
      }
    }
    try { localStorage.setItem(`class:${session.classId}:name`, trimmed); } catch {}
    setSession({
      ...session,
      studentName: trimmed,
      isLeader: willBeLeader || cls.leader_name === trimmed,
    });
    setBusy(false);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto pt-16">
        <div className="sketch-card space-y-4">
          <div>
            <span className="pill-chip pill-chip-coral mb-2 inline-block">הצטרפות לקבוצה</span>
            <h1 className="font-sketch text-2xl mb-1">איך קוראים לכם?</h1>
            <p className="font-hand text-sm text-muted-foreground">
              השם שלכם יופיע לחברי הקבוצה. הראשון שמצטרף הופך לראש הקבוצה.
            </p>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="השם המלא שלכם"
            dir="rtl"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button
            onClick={submit}
            disabled={busy || !name.trim()}
            className="sketch-btn w-full disabled:opacity-50"
          >
            {busy ? "רגע..." : "כניסה לקבוצה"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
