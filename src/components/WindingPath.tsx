import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { STEPS, TOTAL_STEPS, PHASES, type ProcessPhase } from "@/lib/steps";
import { useProject } from "@/contexts/ProjectContext";

const PHASE_COLORS: Record<ProcessPhase, string> = {
  problem: "hsl(0, 70%, 55%)",
  solution: "hsl(40, 85%, 55%)",
  development: "hsl(145, 55%, 42%)",
};

const PROBLEM_POSITIONS: Record<string, { x: number; y: number }> = {
  empathy_map:   { x: 240, y: 70 },
  converge:      { x: 120, y: 170 },
  user_persona:  { x: 360, y: 170 },
  jtbd:          { x: 240, y: 200 },
  journey_map:   { x: 80,  y: 290 },
  pov_statement: { x: 240, y: 330 },
  how_might_we:  { x: 400, y: 290 },
  five_whys:     { x: 240, y: 430 },
};

const PROBLEM_CONNECTIONS: [string, string][] = [
  ["empathy_map", "converge"],
  ["empathy_map", "user_persona"],
  ["empathy_map", "jtbd"],
  ["converge", "pov_statement"],
  ["converge", "journey_map"],
  ["user_persona", "jtbd"],
  ["user_persona", "pov_statement"],
  ["jtbd", "pov_statement"],
  ["journey_map", "pov_statement"],
  ["pov_statement", "how_might_we"],
  ["pov_statement", "five_whys"],
  ["how_might_we", "five_whys"],
];

const WindingPath = () => {
  const { isStepCompleted } = useProject();
  const r = 32;

  const problemSteps = STEPS.filter((s) => s.phase === "problem");
  const solutionSteps = STEPS.filter((s) => s.phase === "solution");
  const devSteps = STEPS.filter((s) => s.phase === "development");

  const linearStartY = 520;
  const linearSpacing = 120;
  const linearSteps = [...solutionSteps, ...devSteps];

  const linearPositions: Record<string, { x: number; y: number }> = {};
  linearSteps.forEach((step, i) => {
    const y = linearStartY + i * linearSpacing;
    const x = i % 2 === 0 ? 180 : 300;
    linearPositions[step.key] = { x, y };
  });

  const allPositions = { ...PROBLEM_POSITIONS, ...linearPositions };
  const totalHeight = linearStartY + (linearSteps.length - 1) * linearSpacing + 100;

  const buildLinearPath = () => {
    if (linearSteps.length < 2) return "";
    const pts = linearSteps.map((s) => linearPositions[s.key]);
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const midY = (curr.y + next.y) / 2;
      d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const transitionPath = (() => {
    const from = PROBLEM_POSITIONS.five_whys;
    const to = linearPositions[solutionSteps[0]?.key];
    if (!from || !to) return "";
    return `M ${from.x} ${from.y + r + 5} L ${to.x} ${to.y - r - 5}`;
  })();

  const problemRegion = { startY: 30, endY: 475 };
  const solutionStart = linearPositions[solutionSteps[0]?.key];
  const solutionEnd = linearPositions[solutionSteps[solutionSteps.length - 1]?.key];
  const devStart = linearPositions[devSteps[0]?.key];
  const devEnd = linearPositions[devSteps[devSteps.length - 1]?.key];

  const phaseRegions = [
    { ...PHASES[0], startY: problemRegion.startY, endY: problemRegion.endY, midY: (problemRegion.startY + problemRegion.endY) / 2 },
    solutionStart && solutionEnd ? { ...PHASES[1], startY: solutionStart.y - r - 15, endY: solutionEnd.y + r + 15, midY: (solutionStart.y + solutionEnd.y) / 2 } : null,
    devStart && devEnd ? { ...PHASES[2], startY: devStart.y - r - 15, endY: devEnd.y + r + 15, midY: (devStart.y + devEnd.y) / 2 } : null,
  ].filter(Boolean) as { key: ProcessPhase; title: string; emoji: string; startY: number; endY: number; midY: number }[];

  const renderNode = (step: (typeof STEPS)[0]) => {
    const pos = allPositions[step.key];
    if (!pos) return null;
    const Icon = step.icon;
    const completed = isStepCompleted(step.key);
    const phaseColor = PHASE_COLORS[step.phase];

    return (
      <Link key={step.key} to={step.url}>
        <g
          className="cursor-pointer group"
          style={{ animation: `fade-in 0.4s ease ${step.num * 80}ms both` }}
        >
          <circle
            cx={pos.x}
            cy={pos.y}
            r={r}
            fill="hsl(var(--background))"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            className="transition-all duration-200 group-hover:fill-[hsl(var(--secondary))]"
          />

          {completed && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={r + 5}
              fill="none"
              stroke={phaseColor}
              strokeWidth="2"
              strokeDasharray="3 2"
            />
          )}

          <foreignObject
            x={pos.x - 10}
            y={pos.y - 16}
            width="20"
            height="20"
          >
            <div className="flex items-center justify-center w-full h-full">
              {completed ? (
                <Check size={14} className="text-foreground" strokeWidth={2} />
              ) : (
                <Icon size={14} className="text-foreground" strokeWidth={1.5} />
              )}
            </div>
          </foreignObject>

          <text
            x={pos.x}
            y={pos.y + 12}
            textAnchor="middle"
            className="fill-foreground"
            style={{ fontSize: "7px", fontWeight: 600 }}
          >
            {step.title.toUpperCase()}
          </text>
        </g>
      </Link>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`0 0 480 ${totalHeight}`}
        className="w-full max-w-md h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* תוויות שלבים */}
        {phaseRegions.map((phase) => (
          <g key={phase.key}>
            <line
              x1="455"
              y1={phase.startY}
              x2="455"
              y2={phase.endY}
              stroke={PHASE_COLORS[phase.key]}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <text
              x="466"
              y={phase.midY}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(90, 466, ${phase.midY})`}
              fill={PHASE_COLORS[phase.key]}
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {phase.title}
            </text>
          </g>
        ))}

        {/* חיבורי אשכול בעיה */}
        {PROBLEM_CONNECTIONS.map(([from, to], i) => {
          const p1 = PROBLEM_POSITIONS[from];
          const p2 = PROBLEM_POSITIONS[to];
          if (!p1 || !p2) return null;
          return (
            <line
              key={`conn-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="hsl(var(--foreground))"
              strokeWidth="0.8"
              strokeOpacity="0.2"
              className="animate-draw-path"
            />
          );
        })}

        {/* קו מעבר מבעיה לפתרון */}
        <path
          d={transitionPath}
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          fill="none"
        />

        {/* נתיב ליניארי */}
        <path
          d={buildLinearPath()}
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="animate-draw-path"
        />

        {/* חץ בסוף */}
        {(() => {
          const lastStep = linearSteps[linearSteps.length - 1];
          if (!lastStep) return null;
          const last = linearPositions[lastStep.key];
          return (
            <polygon
              points={`${last.x},${last.y + r + 12} ${last.x - 6},${last.y + r + 4} ${last.x + 6},${last.y + r + 4}`}
              fill="hsl(var(--foreground))"
            />
          );
        })()}

        {/* תווית "לא ליניארי" */}
        <text
          x="240"
          y="25"
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          style={{ fontSize: "8px", fontStyle: "italic", letterSpacing: "0.05em" }}
        >
          ↕ חקרו בכל סדר
        </text>

        {/* כל צמתי השלבים */}
        {STEPS.map(renderNode)}
      </svg>
    </div>
  );
};

export default WindingPath;
