import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProject } from "@/contexts/ProjectContext";
import { useClass } from "@/contexts/ClassContext";
import { STEPS, PHASES } from "@/lib/steps";
import { Calendar, MapPin, Lightbulb, ArrowLeft, Users, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventInfo {
  event_date?: string | null;
  event_time?: string | null;
  event_location?: string | null;
  event_topic?: string | null;
}

const PHASE_BADGE: Record<string, string> = {
  problem: "pill-chip-coral",
  solution: "pill-chip-sun",
  development: "pill-chip-mint",
  presentation: "pill-chip",
};

const Index = () => {
  const { isStepCompleted, isLoading } = useProject();
  const { session, isClassMode, isLeader } = useClass();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!isClassMode || !session) return;
    supabase
      .from("classes")
      .select("event_date, event_time, event_location, event_topic, student_names")
      .eq("id", session.classId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setEvent({
          event_date: data.event_date,
          event_time: data.event_time,
          event_location: data.event_location,
          event_topic: data.event_topic,
        });
        setMembers(data.student_names || []);
      });
  }, [isClassMode, session]);

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
        {/* HERO */}
        <section className="text-center pt-6 pb-12">
          <span className="pill-chip pill-chip-coral mb-6 inline-block">האקתון לחשיבה עיצובית</span>
          <h1 className="display-mega leading-[0.85] mb-4">
            חשוב.<br/>צור.<br/>הצג.
          </h1>
          <p className="font-hand text-2xl md:text-3xl max-w-2xl mx-auto leading-snug text-foreground/80">
            לוקחים בעיה אמיתית, חופרים בה לעומק, ובונים פתרון שאפשר להראות —
            תוך שימוש בכלי AI שעוזרים לכם לחשוב חד יותר.
          </p>
        </section>

        {/* GROUP + EVENT CARD (only in class mode) */}
        {isClassMode && session && (
          <section className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="sketch-card">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" />
                <span className="pill-chip pill-chip-outline">הקבוצה שלכם</span>
              </div>
              <h2 className="display-huge mb-3" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
                {session.className}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-hand text-base">{session.studentName}</span>
                {isLeader && (
                  <span className="pill-chip pill-chip-sun text-[10px] flex items-center gap-1">
                    <Crown className="h-3 w-3" /> ראש קבוצה
                  </span>
                )}
              </div>
              {members.length > 1 && (
                <p className="font-hand text-sm text-muted-foreground">
                  חברי קבוצה: {members.filter((m) => m !== session.studentName).join(" · ")}
                </p>
              )}
              <div className="mt-4 text-xs font-sketch tracking-wider uppercase text-muted-foreground">
                התקדמות: {completedCount}/{STEPS.length} שלבים
              </div>
            </div>

            {(event?.event_date || event?.event_location || event?.event_topic) && (
              <div className="sketch-card">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5" />
                  <span className="pill-chip pill-chip-outline">פרטי האירוע</span>
                </div>
                {event.event_topic && (
                  <h3 className="display-huge mb-3" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)" }}>
                    {event.event_topic}
                  </h3>
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

        {/* 10 STEPS LIST */}
        <section className="mb-12">
          <span className="pill-chip pill-chip-outline mb-3 inline-block">המסע המלא</span>
          <h2 className="display-huge mb-6">{STEPS.length} שלבים, סיפור אחד.</h2>
          <div className="space-y-2">
            {STEPS.map((step) => {
              const completed = isStepCompleted(step.key);
              const phaseIdx = PHASES.findIndex((p) => p.key === step.phase);
              return (
                <Link
                  key={step.key}
                  to={step.url}
                  className="sketch-border-thin bg-card hover:bg-accent/30 transition-colors flex items-center gap-4 p-3 group"
                >
                  <span className="font-sketch text-2xl tabular-nums w-10 text-foreground/50">
                    {String(step.num).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-sketch text-lg leading-tight">{step.title}</div>
                    <div className="text-xs font-sketch tracking-wider uppercase text-muted-foreground">
                      פאזה {phaseIdx + 1} · {PHASES[phaseIdx].title}
                    </div>
                  </div>
                  {completed && <span className="pill-chip pill-chip-mint text-[10px]">הושלם</span>}
                  <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </Link>
              );
            })}
          </div>
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
        </section>
      </div>
    </Layout>
  );
};

export default Index;
