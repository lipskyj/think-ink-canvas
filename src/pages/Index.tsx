import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHackathon } from "@/contexts/HackathonContext";
import { useProject } from "@/contexts/ProjectContext";
import { SPRINT_BLOCKS, ROLE_LABEL, type TeamRole, type BlockKey } from "@/lib/hackathon";
import { STEPS, PHASES, type ProcessPhase } from "@/lib/steps";
import { Check, Loader2, Rocket, Clock, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const PHASE_COLORS: Record<ProcessPhase, string> = {
  problem: "hsl(0, 70%, 55%)",
  solution: "hsl(40, 85%, 55%)",
  development: "hsl(145, 55%, 42%)",
};

const ROLES: TeamRole[] = ["researcher", "designer", "builder", "pitcher"];

const Index = () => {
  const { isStepCompleted, isLoading } = useProject();
  const { state, enableMode, disableMode, setCurrentBlock } = useHackathon();
  const [showSetup, setShowSetup] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [duration, setDuration] = useState(state.durationMin);
  const [teamName, setTeamName] = useState(state.teamName);
  const [theme, setTheme] = useState(state.theme);
  const [teamSize, setTeamSize] = useState(state.teamSize);
  const [role, setRole] = useState<TeamRole>(state.myRole ?? "builder");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
      </Layout>
    );
  }

  // ── HACKATHON MODE HOME ──
  if (state.enabled) {
    const currentBlock = SPRINT_BLOCKS.find((b) => b.key === state.currentBlock)!;
    const blockProgress = (b: typeof currentBlock) => {
      const done = b.subSteps.filter((s) => isStepCompleted(s.stepKey)).length;
      return { done, total: b.subSteps.length };
    };
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-sketch mb-2">
              {state.teamName ? state.teamName : "מצב האקתון"} 🚀
            </h1>
            <p className="font-hand text-xl text-muted-foreground">
              6 שעות. בעיה → פתרון → בנייה → פיץ׳.
            </p>
          </div>

          {/* Continue card */}
          <div
            className="sketch-card p-6 border-2"
            style={{ borderColor: currentBlock.color }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{currentBlock.emoji}</span>
              <div>
                <div className="text-xs text-muted-foreground font-hand">השלב הנוכחי</div>
                <h2 className="font-sketch text-2xl">{currentBlock.title}</h2>
              </div>
              <div className="flex-1" />
              <div className="text-left">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={14} /> {currentBlock.minutes} ד׳
                </div>
                <div className="text-xs text-muted-foreground font-hand">
                  מוביל/ה: {ROLE_LABEL[currentBlock.leadRole]}
                </div>
              </div>
            </div>
            <p className="font-hand text-lg mb-3">{currentBlock.tagline}</p>
            <ul className="font-hand text-base mb-4 space-y-1">
              {currentBlock.deliverables.map((d) => (
                <li key={d}>✦ {d}</li>
              ))}
            </ul>
            <div className="space-y-2">
              {currentBlock.subSteps.map((sub) => {
                const completed = isStepCompleted(sub.stepKey);
                return (
                  <Link
                    key={sub.stepKey}
                    to={sub.url}
                    className="flex items-center gap-3 p-3 rounded border border-foreground/20 hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center border-2"
                      style={{
                        borderColor: completed ? currentBlock.color : "hsl(var(--border))",
                        backgroundColor: completed ? currentBlock.color : "transparent",
                        color: completed ? "white" : "inherit",
                      }}
                    >
                      {completed && <Check size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-sketch text-base">{sub.title}</div>
                      <div className="text-xs text-muted-foreground font-hand">
                        {sub.minutes} ד׳ · {ROLE_LABEL[sub.role]}
                      </div>
                    </div>
                    <ArrowLeft size={16} className="text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Block selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SPRINT_BLOCKS.map((b) => {
              const p = blockProgress(b);
              const active = b.key === state.currentBlock;
              return (
                <button
                  key={b.key}
                  onClick={() => setCurrentBlock(b.key)}
                  className={`sketch-card p-3 text-center transition-all ${active ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100"}`}
                  style={{ borderColor: b.color }}
                >
                  <div className="text-2xl">{b.emoji}</div>
                  <div className="font-sketch text-sm">{b.title}</div>
                  <div className="text-xs text-muted-foreground font-hand">{p.done}/{p.total} · {b.minutes}ד׳</div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link to="/deliverables">
              <Button variant="default">📦 מסירה</Button>
            </Link>
            <Link to="/pitch">
              <Button variant="outline">🎤 פיץ׳</Button>
            </Link>
            <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
              {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />} כל 15 השלבים
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={disableMode}>
              צא ממצב האקתון
            </Button>
          </div>

          {showAll && <ClassicGrid />}
        </div>
      </Layout>
    );
  }

  // ── CLASSIC HOME ──
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-sketch mb-3">
            חשיבה עיצובית<br />
            <span className="doodle-underline">ערכת כלים</span> ✏️
          </h1>
          <p className="font-hand text-2xl text-muted-foreground">
            תהליך מובנה ממפת אמפתיה ועד פיץ׳.
          </p>
        </div>

        {/* Hackathon CTA */}
        <div className="sketch-card p-5 mb-8 border-2 border-foreground bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Rocket size={20} />
            <h2 className="font-sketch text-xl">מצב האקתון — 6 שעות</h2>
          </div>
          <p className="font-hand text-lg mb-3">
            ארבעה בלוקים: בעיה (60ד׳) · פתרון (60ד׳) · בנייה (3ש׳) · פיץ׳ (60ד׳).<br />
            טיימר על המסך כל הזמן. תוצר אחד בסוף — מוכן לבמה.
          </p>
          {!showSetup ? (
            <Button onClick={() => setShowSetup(true)} size="lg">
              <Rocket size={16} /> התחל האקתון
            </Button>
          ) : (
            <div className="space-y-3 mt-3">
              <div>
                <Label className="font-hand">נושא ההאקתון (אופציונלי)</Label>
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="לדוגמה: נוער ובריאות נפש / קיימות בבית הספר"
                />
                <p className="text-xs text-muted-foreground font-hand mt-1">
                  ה-AI ישתמש בזה כדי לחבר דוגמאות לחיי הצוות. אפשר להשאיר ריק.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-hand">שם הצוות</Label>
                  <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="לדוגמה: Team Beta" />
                </div>
                <div>
                  <Label className="font-hand">משך (דקות)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value) || 360)} />
                </div>
                <div>
                  <Label className="font-hand">גודל צוות</Label>
                  <Input type="number" value={teamSize} min={1} max={8} onChange={(e) => setTeamSize(Number(e.target.value) || 4)} />
                </div>
                <div>
                  <Label className="font-hand">התפקיד שלי</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TeamRole)}
                    className="w-full h-10 px-3 border border-input rounded-md bg-background"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  enableMode({ durationMin: duration, teamSize, myRole: role, teamName, theme });
                }}
              >
                🚀 צא לדרך — התחל טיימר
              </Button>
            </div>
          )}
        </div>

        <ClassicGrid />
      </div>
    </Layout>
  );
};

const ClassicGrid = () => {
  const { isStepCompleted } = useProject();
  return (
    <div className="space-y-8">
      {PHASES.map((phase) => {
        const phaseSteps = STEPS.filter((s) => s.phase === phase.key);
        const completedCount = phaseSteps.filter((s) => isStepCompleted(s.key)).length;
        return (
          <div key={phase.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PHASE_COLORS[phase.key] }} />
              <h2 className="font-sketch text-xl">{phase.emoji} {phase.title}</h2>
              <span className="text-xs text-muted-foreground font-hand ml-auto">
                {completedCount}/{phaseSteps.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {phaseSteps.map((step) => {
                const completed = isStepCompleted(step.key);
                const Icon = step.icon;
                return (
                  <Link
                    key={step.key}
                    to={step.url}
                    className="sketch-card p-4 flex flex-col items-center text-center gap-2 hover:bg-secondary/50 transition-colors relative"
                  >
                    {completed && (
                      <div
                        className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: PHASE_COLORS[step.phase], color: "white" }}
                      >
                        <Check size={12} />
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-border">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="font-sketch text-xs leading-tight">{step.num}. {step.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Index;
