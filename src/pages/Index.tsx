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
}

const PHASE_BADGE: Record<string, string> = {
  problem: "pill-chip-coral",
  solution: "pill-chip-sun",
  development: "pill-chip-mint",
  presentation: "pill-chip",
};

const Index = () => {
  const { isStepCompleted, isLoading, loadDemoCase } = useProject();
  const { session, isClassMode, isLeader } = useClass();
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
      .select("id, name, join_code, student_names, team_avatar_url, event_date, event_time, event_location, event_topic, event_description, organizer_logo_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => setGroups((data || []) as GroupRow[]));
  }, []);

  // Public event banner (shown to everyone, not only inside a class). Use the latest non-empty event fields across groups.
  const publicEvent = (() => {
    const src = groups.find((g) => g.event_topic || g.event_date || g.event_location || g.organizer_logo_url);
    if (!src) return null;
    return {
      event_topic: src.event_topic,
      event_date: src.event_date,
      event_time: src.event_time,
      event_location: src.event_location,
      event_description: src.event_description,
      organizer_logo_url: src.organizer_logo_url,
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
        <section className="text-center pt-6 pb-10">
          {publicEvent ? (
            <>
              {publicEvent.organizer_logo_url && (
                <img
                  src={publicEvent.organizer_logo_url}
                  alt="לוגו המארגן"
                  className="h-24 max-w-[240px] object-contain mx-auto mb-6"
                />
              )}
              <span className="pill-chip pill-chip-coral mb-6 inline-block">האקתון לחשיבה עיצובית</span>
              {publicEvent.event_topic && (
                <h1 className="display-mega leading-[0.88] mb-8" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
                  {publicEvent.event_topic}
                </h1>
              )}
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-hand text-3xl md:text-4xl text-foreground/85 mb-5">
                {(publicEvent.event_date || publicEvent.event_time) && (
                  <span className="inline-flex items-center gap-3">
                    <Calendar className="h-8 w-8" strokeWidth={2.2} />
                    {[publicEvent.event_date, publicEvent.event_time].filter(Boolean).join(" · ")}
                  </span>
                )}
                {publicEvent.event_location && (
                  <span className="inline-flex items-center gap-3">
                    <MapPin className="h-8 w-8" strokeWidth={2.2} /> {publicEvent.event_location}
                  </span>
                )}
                <span className="inline-flex items-center gap-3">
                  <Users className="h-8 w-8" strokeWidth={2.2} /> {teamCount} {teamCount === 1 ? "קבוצה" : "קבוצות"}
                </span>
              </div>
              {publicEvent.event_description && (
                <p className="font-hand text-xl md:text-2xl max-w-2xl mx-auto leading-snug text-foreground/75 whitespace-pre-wrap">
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




        {/* JOIN BY CODE — only when not yet in a group */}
        {!isClassMode && (
          <section className="sketch-card mb-12 max-w-2xl mx-auto border-2">
            <div className="flex items-center gap-3 mb-4">
              <LogIn className="h-7 w-7" />
              <h2 className="font-sketch text-3xl">הצטרפו לקבוצה</h2>
            </div>
            <p className="font-hand text-lg text-muted-foreground mb-5">
              הזינו את קוד הקבוצה שקיבלתם מהמארגן (למשל A6, Z2).
            </p>
            <div className="flex gap-3">
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="A6"
                maxLength={4}
                className="text-center font-sketch text-4xl tracking-widest uppercase h-16"
                dir="ltr"
                onKeyDown={(e) => e.key === "Enter" && joinByCode()}
              />
              <button
                onClick={joinByCode}
                disabled={joining || !codeInput.trim()}
                className="sketch-btn flex items-center gap-2 disabled:opacity-50 text-lg px-6"
              >
                {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowLeft className="h-5 w-5" />}
                המשך
              </button>
            </div>
          </section>
        )}


        {/* GROUP + EVENT CARD (only in class mode) */}
        {isClassMode && session && (
          <section className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="sketch-card">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="pill-chip pill-chip-outline">הקבוצה שלכם</span>
                </div>
                <Link to="/team" className="sketch-btn-outline text-xs flex items-center gap-1 px-2 py-1">
                  <Pencil className="h-3 w-3" /> ערוך
                </Link>
              </div>

              {event?.team_avatar_url && (
                <img
                  src={event.team_avatar_url}
                  alt={session.className}
                  className="w-full max-w-[220px] mx-auto mb-3 rounded-md"
                />
              )}

              <h2 className="display-huge mb-3 text-center" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
                {session.className}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-hand text-base">{session.studentName}</span>
                {isLeader && (
                  <span className="pill-chip pill-chip-sun text-[10px] flex items-center gap-1">
                    <Crown className="h-3 w-3" /> ראש קבוצה
                  </span>
                )}
              </div>
              {members.length > 1 && (
                <p className="font-hand text-sm text-muted-foreground text-center">
                  {members.filter((m) => m !== session.studentName).join(" · ")}
                </p>
              )}
              <div className="mt-4 text-xs font-sketch tracking-wider uppercase text-muted-foreground text-center">
                התקדמות: {completedCount}/{STEPS.length}
              </div>
            </div>

            {(event?.event_date || event?.event_location || event?.event_topic || event?.organizer_logo_url) && (
              <div className="sketch-card">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="pill-chip pill-chip-outline">פרטי האירוע</span>
                  </div>
                  {event.organizer_logo_url && (
                    <img src={event.organizer_logo_url} alt="לוגו המארגן" className="h-10 max-w-[80px] object-contain" />
                  )}
                </div>
                {event.event_topic && (
                  <h3 className="display-huge mb-3" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)" }}>
                    {event.event_topic}
                  </h3>
                )}
                {event.event_description && (
                  <p className="font-hand text-sm text-foreground/80 mb-3 whitespace-pre-wrap">
                    {event.event_description}
                  </p>
                )}
                <div className="space-y-2 font-hand text-base">
                  {(event.event_date || event.event_time) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{[event.event_date, event.event_time].filter(Boolean).join(" · ")}</span>
                    </div>
                  )}
                  {event.event_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{event.event_location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {editedGroups.map((group) => (
                  <div key={group.id} className="sketch-card flex items-center gap-3">
                    {group.team_avatar_url ? (
                      <img src={group.team_avatar_url} alt={group.name} className="w-14 h-14 object-cover rounded-md sketch-border-thin shrink-0" />
                    ) : (
                      <div className="w-14 h-14 sketch-border-thin rounded-md flex items-center justify-center shrink-0 bg-secondary/40">
                        <Users className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-sketch text-base truncate">{group.name}</h3>
                      <p className="font-hand text-xs text-muted-foreground">
                        {group.student_names?.length || 0} חברים
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
