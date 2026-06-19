import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClass } from "@/contexts/ClassContext";
import { Users, LogIn, Crown, Calendar, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ClassRow {
  id: string;
  name: string;
  student_names: string[];
  leader_name: string | null;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  event_topic: string | null;
}

export default function JoinClass() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { setSession } = useClass();
  const { toast } = useToast();
  const [cls, setCls] = useState<ClassRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupName, setGroupName] = useState("");
  const [myName, setMyName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!classId) return;
    supabase
      .from("classes")
      .select("id, name, student_names, leader_name, event_date, event_time, event_location, event_topic")
      .eq("id", classId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("הקבוצה לא נמצאה");
        } else {
          setCls(data as ClassRow);
          setGroupName(data.name || "");
        }
        setLoading(false);
      });
  }, [classId]);

  const join = async () => {
    if (!cls || !myName.trim()) return;
    setBusy(true);
    const trimmed = myName.trim();
    const hasLeader = !!cls.leader_name;
    const willBeLeader = !hasLeader;
    const updates: any = {};
    // Add my name to roster if missing
    if (!cls.student_names.includes(trimmed)) {
      updates.student_names = [...cls.student_names, trimmed];
    }
    // Set me as leader if no leader yet
    if (willBeLeader) {
      updates.leader_name = trimmed;
      // Leader can edit group name on first join
      if (groupName.trim() && groupName.trim() !== cls.name) {
        updates.name = groupName.trim();
      }
    }
    if (Object.keys(updates).length > 0) {
      const { error: err } = await supabase.from("classes").update(updates).eq("id", cls.id);
      if (err) {
        toast({ title: "שגיאה", description: err.message, variant: "destructive" });
        setBusy(false);
        return;
      }
    }
    setSession({
      classId: cls.id,
      className: updates.name || cls.name,
      studentName: trimmed,
      isLeader: willBeLeader || cls.leader_name === trimmed,
    });
    navigate("/team");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="sketch-card text-center p-8 max-w-sm">
          <p className="font-sketch text-xl text-destructive mb-2">{error}</p>
          <p className="font-hand text-muted-foreground">בדקו שהקישור תקין</p>
        </div>
      </div>
    );
  }

  const hasLeader = !!cls.leader_name;
  const eventLine = [cls.event_date, cls.event_time].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="vibe-backdrop" aria-hidden><span className="vibe-blob-3" /><span className="vibe-blob-4" /></div>
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <span className="pill-chip pill-chip-coral mb-3 inline-block">הצטרפות לקבוצה</span>
          <h1 className="display-huge leading-tight">{hasLeader ? cls.name : "קבוצה חדשה"}</h1>
        </div>

        {(eventLine || cls.event_location || cls.event_topic) && (
          <div className="sketch-card mb-4 space-y-2 font-hand text-base">
            {cls.event_topic && <p className="font-sketch text-lg">{cls.event_topic}</p>}
            {eventLine && <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/> {eventLine}</div>}
            {cls.event_location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {cls.event_location}</div>}
          </div>
        )}

        <div className="sketch-card space-y-4">
          {!hasLeader ? (
            <>
              <div className="pill-chip pill-chip-sun text-[10px] flex items-center gap-1 w-fit">
                <Crown className="h-3 w-3" /> אתם הראשונים — תהיו ראש הקבוצה
              </div>
              <p className="font-hand text-sm text-muted-foreground">
                ראש הקבוצה הוא היחיד שיכול לערוך את שם הקבוצה ולהפעיל/לכבות את ה-AI במהלך העבודה.
              </p>
              <div>
                <label className="font-sketch text-xs uppercase tracking-wider block mb-1">שם הקבוצה</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="למשל: צוות סופרנובה"
                  dir="rtl"
                />
              </div>
            </>
          ) : (
            <div className="font-hand text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> ראש הקבוצה: <strong>{cls.leader_name}</strong>
              {cls.student_names.length > 0 && (
                <span>· {cls.student_names.length} חברים</span>
              )}
            </div>
          )}

          <div>
            <label className="font-sketch text-xs uppercase tracking-wider block mb-1">השם שלכם</label>
            <Input
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="השם המלא שלכם"
              dir="rtl"
              onKeyDown={(e) => e.key === "Enter" && join()}
            />
          </div>

          <button
            onClick={join}
            disabled={busy || !myName.trim() || (!hasLeader && !groupName.trim())}
            className="sketch-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" /> הצטרפו לקבוצה
          </button>
        </div>
      </div>
    </div>
  );
}
