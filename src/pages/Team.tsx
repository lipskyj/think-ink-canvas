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

  const generate = async () => {
    setGenerating(true);
    setPendingAvatar(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-team-avatar", {
        body: {
          teamName,
          members: members.filter((m) => m.name.trim() || m.gender),
          situation,
        },
      });
      if (error) throw error;
      if (data?.dataUrl) {
        setPendingAvatar(data.dataUrl);
      } else {
        throw new Error("לא הוחזרה תמונה");
      }
    } catch (e: any) {
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
            <label className="font-sketch text-xs uppercase tracking-wider block mb-2">מה הקבוצה עושה?</label>
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={2}
              dir="rtl"
              placeholder="לדוגמה: רוקדים בים, מטיילים בעיר, יושבים סביב מחשב..."
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SITUATION_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSituation(s)}
                  className="pill-chip pill-chip-outline text-xs cursor-pointer"
                >
                  {s}
                </button>
              ))}
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
                <p className="text-xs font-hand text-center text-muted-foreground mt-2">
                  טיוטה — לחצו "שמור" כדי לקבע
                </p>
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
