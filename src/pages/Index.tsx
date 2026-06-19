import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProject } from "@/contexts/ProjectContext";
import { useClass } from "@/contexts/ClassContext";
import { STEPS, PHASES } from "@/lib/steps";
import { Calendar, MapPin, Lightbulb, ArrowLeft, Users, Crown, Loader2, LogIn, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface EventInfo {
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
  event_topic?: string | null;
  event_description?: string | null;
  organizer_logo_url?: string | null;
  team_avatar_url?: string | null;
}

interface GroupRow {
  id: string;
  name: string;
  join_code: string | null;
  student_names: string[];
  team_avatar_url?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
  event_topic?: string | null;
  event_description?: string | null;
  organizer_logo_url?: string | null;
  organizer_name?: string | null;
}

const PHASE_BADGE: Record<string, string> = {
  problem: "pill-chip-coral",
  solution: "pill-chip-sun",
  development: "pill-chip-mint",
  presentation: "pill-chip",
};

const Index = () => {
  const { isStepCompleted, isLoading, loadDemoCase } = useProject();
  const { session, isClassMode, isLeader, setSession } = useClass();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    supabase
      .from("classes")
      .select("id, name, join_code, student_names, team_avatar_url, event_date, event_time, event_location, event_topic, event_description, organizer_logo_url, organizer_name")
      .order("created_at", { ascending: false })
      .then(({ data }) => setGroups((data || []) as GroupRow[]));
  }, []);

  // Public event banner (shown to everyone, not only inside a class). Use the latest non-empty event fields across groups.
  const publicEvent = (() => {
    const src = groups.find((g) => g.event_topic || g.event_date || g.event_location || g.organizer_logo_url || g.organizer_name);
    if (!src) return null;
    return {
      event_topic: src.event_topic,
      event_date: src.event_date,
      event_time: src.event_time,
      event_location: src.event_location,
      event_description: src.event_description,
      organizer_logo_url: src.organizer_logo_url,
      organizer_name: src.organizer_name,
    };
  })();
  const teamCount = groups.length;

  useEffect(() => {
    if (!isClassMode || !session) return;
    supabase
      .from("classes")
      .select("event_date, event_time, event_location, event_topic, event_description, organizer_logo_url, team_avatar_url, student_names")
      .eq("id", session.classId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setEvent({
          event_date: data.event_date,
          event_time: data.event_time,
          event_location: data.event_location,
          event_topic: data.event_topic,
          event_description: (data as any).event_description,
          organizer_logo_url: (data as any).organizer_logo_url,
          team_avatar_url: (data as any).team_avatar_url,
        });
        setMembers(data.student_names || []);
      });
  }, [isClassMode, session]);

  const joinByCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    const { data, error } = await supabase
      .from("classes")
      .select("id")
      .eq("join_code", code)
      .maybeSingle();
    setJoining(false);
    if (error || !data) {
      toast({ title: "קוד לא נמצא", description: "בדקו את הקוד עם המארגן", variant: "destructive" });
      return;
    }
    navigate(`/join/${data.id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  const firstStep = STEPS[0];
  const completedCount = STEPS.filter((s) => isStepCompleted(s.key)).length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-16">
        {/* HERO — tailored to the event when admin has set details */}
        <section className="text-center pt-4 pb-14 relative">
          {publicEvent ? (
            <>
              {publicEvent.organizer_logo_url && (
                <img
                  src={publicEvent.organizer_logo_url}
                  alt={publicEvent.organizer_name || "לוגו המארגן"}
                  className="h-32 max-w-[280px] object-contain mx-auto mb-6"
                />
              )}
              {publicEvent.organizer_name && (
                <p className="font-sketch text-2xl md:text-3xl text-foreground/80 mb-4">
                  {publicEvent.organizer_name}
                </p>
              )}
              <span className="pill-chip pill-chip-coral mb-8 inline-block text-base px-4 py-1.5">
                האקתון לחשיבה עיצובית
              </span>
              {publicEvent.event_topic && (
                <h1
                  className="display-mega leading-[0.86] mb-12 px-2"
                  style={{ fontSize: "clamp(4rem, 12vw, 9.5rem)" }}
                >
                  {publicEvent.event_topic}
                </h1>
              )}
              <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8 font-sketch text-foreground mb-8">
                {(publicEvent.event_date || publicEvent.event_time) && (
                  <span className="inline-flex items-center gap-4 sketch-card !py-5 !px-7">
                    <Calendar className="h-12 w-12" strokeWidth={2.2} />
                    <span style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)" }}>
                      {[publicEvent.event_date, publicEvent.event_time].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                )}
                {publicEvent.event_location && (
                  <span className="inline-flex items-center gap-4 sketch-card !py-5 !px-7">
                    <MapPin className="h-12 w-12" strokeWidth={2.2} />
                    <span style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)" }}>
                      {publicEvent.event_location}
                    </span>
                  </span>
                )}
                <span className="inline-flex items-center gap-4 sketch-card !py-5 !px-7">
                  <Users className="h-12 w-12" strokeWidth={2.2} />
                  <span style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)" }}>
                    {teamCount} {teamCount === 1 ? "קבוצה" : "קבוצות"}
                  </span>
                </span>
              </div>
              {publicEvent.event_description && (
                <p className="font-hand text-2xl md:text-3xl max-w-3xl mx-auto leading-snug text-foreground/80 whitespace-pre-wrap mt-8">
                  {publicEvent.event_description}
                </p>
              )}
            </>


          ) : (
            <>
              <span className="pill-chip pill-chip-coral mb-6 inline-block">האקתון לחשיבה עיצובית</span>
              <h1 className="display-mega leading-[0.85] mb-4">
                חשוב.<br/>צור.<br/>הצג.
              </h1>
              <p className="font-hand text-2xl md:text-3xl max-w-2xl mx-auto leading-snug text-foreground/80">
                לוקחים בעיה אמיתית, חופרים בה לעומק, ובונים פתרון שאפשר להראות —
                תוך שימוש בכלי AI שעוזרים לכם לחשוב חד יותר.
              </p>
            </>
          )}
        </section>











        {/* 4 PHASES */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <span className="pill-chip pill-chip-outline mb-3 inline-block">איך זה עובד</span>
              <h2 className="display-huge">התהליך<br/>בארבעה שלבים.</h2>
            </div>
            <p className="font-hand text-lg text-muted-foreground max-w-sm">
              עוברים שלב אחרי שלב. בכל שלב יש דף עם הסבר קצר, דוגמה, ומשימה אחת ברורה.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((phase, i) => {
              const phaseSteps = STEPS.filter((s) => s.phase === phase.key);
              const done = phaseSteps.filter((s) => isStepCompleted(s.key)).length;
              return (
                <div key={phase.key} className="sketch-card flex flex-col">
                  <span className={`${PHASE_BADGE[phase.key]} pill-chip text-[10px] self-start mb-3`}>
                    שלב {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-huge mb-2" style={{ fontSize: "clamp(1.4rem,2vw,1.8rem)" }}>
                    {phase.title}
                  </h3>
                  <p className="font-hand text-base text-foreground/75 leading-snug mb-4 flex-1">
                    {phase.description}
                  </p>
                  <div className="text-xs font-sketch tracking-wider uppercase text-muted-foreground">
                    {done}/{phaseSteps.length} · {phaseSteps.length === 1 ? "שלב אחד" : `${phaseSteps.length} שלבים`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 10 steps list removed — too much info on the landing page */}

        {/* GROUPS — only those that have customized themselves */}
        {(() => {
          const editedGroups = groups.filter(
            (g) =>
              !!g.team_avatar_url ||
              (g.student_names && g.student_names.length > 0),
          );

          if (editedGroups.length === 0) return null;
          return (
            <section className="mb-12">
              <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
                <div>
                  <span className="pill-chip pill-chip-outline mb-3 inline-block">קבוצות</span>
                  <h2 className="display-huge">מי כבר בפנים.</h2>
                </div>
                <p className="font-hand text-base text-muted-foreground max-w-sm">
                  הקבוצות שכבר נכנסו, עדכנו שם וצוות, וצבעו את האווטאר שלהן.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedGroups.map((group) => (
                  <div key={group.id} className="sketch-card relative pt-10 text-center">
                    <span className="pill-chip pill-chip-outline absolute top-3 right-3 text-[10px] flex items-center gap-1">
                      <Users className="h-3 w-3" /> הקבוצה
                    </span>
                    <button
                      onClick={() => {
                        const entered = window.prompt(`כדי לערוך את "${group.name}" הזינו את קוד הקבוצה (${group.join_code?.length || 2} תווים):`);
                        if (!entered) return;
                        if (entered.trim().toUpperCase() === (group.join_code || "").toUpperCase()) {
                          setSession({
                            classId: group.id,
                            className: group.name,
                            studentName: group.student_names?.[0] || "",
                            isLeader: true,
                          });
                          navigate(`/team`);
                        } else {
                          toast({ title: "קוד שגוי", description: "בדקו עם המארגן", variant: "destructive" });
                        }
                      }}
                      className="absolute top-3 left-3 sketch-border-thin rounded-md p-1.5 bg-background hover:bg-secondary/40 transition"
                      aria-label="ערוך קבוצה"
                      title="ערוך קבוצה (דרוש קוד)"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {group.team_avatar_url && (
                      <img
                        src={group.team_avatar_url}
                        alt={group.name}
                        className="w-24 h-24 mx-auto mb-3 object-cover rounded-md sketch-border-thin"
                      />
                    )}
                    <h3 className="font-sketch text-2xl mb-3 leading-tight">{group.name}</h3>
                    {group.student_names && group.student_names.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                        {group.student_names.map((n, i) => (
                          <span
                            key={i}
                            className={`pill-chip text-[11px] inline-flex items-center gap-1 ${
                              i === 0 ? "pill-chip-sun" : "pill-chip-outline"
                            }`}
                          >
                            {i === 0 && <Crown className="h-3 w-3" />}
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="font-hand text-xs text-muted-foreground mt-2">
                      {group.student_names?.length || 0} חברים
                    </p>
                  </div>
                ))}
              </div>

              {!isClassMode && (
                <div className="text-center mt-6">
                  <Link to="/team" className="sketch-btn-outline inline-flex items-center gap-2 text-base">
                    <LogIn className="h-4 w-4" />
                    הצטרפו עם קבוצה חדשה
                  </Link>
                </div>
              )}
            </section>
          );
        })()}



        {/* SUBMISSIONS LINK */}
        <section className="sketch-card mb-8 bg-secondary/20 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-sketch text-xl mb-1">הגשת תוצרים</h3>
            <p className="font-hand text-base text-muted-foreground">
              מצגת + קישור לפיתוח. כל הקבוצות, במקום אחד.
            </p>
          </div>
          <Link to="/submissions" className="sketch-btn inline-flex items-center gap-2">
            לחדר ההגשות <ArrowLeft className="h-4 w-4" />
          </Link>
        </section>

        {/* CTA */}
        <section className="sketch-card text-center bg-gradient-to-br from-card to-secondary/40">
          <Lightbulb className="h-10 w-10 mx-auto mb-3" strokeWidth={2.2} />
          <h2 className="display-huge mb-3" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>
            צאו לדרך — שלב {String(firstStep.num).padStart(2, "0")}
          </h2>
          <p className="font-hand text-lg text-muted-foreground mb-5">
            מתחילים מ{firstStep.title}. כל אחד יכול. אין תשובות נכונות.
          </p>
          <Link to={firstStep.url} className="sketch-btn inline-flex items-center gap-2 text-base">
            בואו נתחיל <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            onClick={async () => {
              await loadDemoCase();
              navigate("/effort-impact");
            }}
            className="sketch-btn-outline inline-flex items-center gap-2 text-base mt-3 mr-2"
          >
            טען מקרה בוחן מוכן
          </button>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
