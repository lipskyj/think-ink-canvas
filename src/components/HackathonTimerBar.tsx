import { useHackathon } from "@/contexts/HackathonContext";
import { formatHMS, SPRINT_BLOCKS } from "@/lib/hackathon";
import { Timer, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const HackathonTimerBar = () => {
  const { state, remainingSec, enableMode, resetTimer } = useHackathon();
  if (!state.enabled) return null;

  const totalSec = state.durationMin * 60;
  const pct = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));
  const low = remainingSec < 30 * 60;
  const critical = remainingSec < 10 * 60;
  const block = SPRINT_BLOCKS.find((b) => b.key === state.currentBlock)!;

  const barColor = critical
    ? "bg-red-500"
    : low
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div
      dir="rtl"
      className="sticky top-0 z-40 border-b border-foreground/20 bg-background/95 backdrop-blur"
    >
      <div className="flex items-center gap-3 px-4 py-2 text-sm">
        <Timer size={16} className={critical ? "text-red-500 animate-pulse" : "text-foreground"} />
        <span className="font-mono font-bold tabular-nums text-base">
          {formatHMS(remainingSec)}
        </span>
        <span className="text-muted-foreground hidden sm:inline">
          {block.emoji} {block.title} · {block.tagline}
        </span>
        <div className="flex-1" />
        {!state.startedAt && (
          <Button size="sm" variant="outline" onClick={() => enableMode()} className="h-7">
            <Play size={12} /> התחל
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={resetTimer} className="h-7" title="אפס טיימר">
          <RotateCcw size={12} />
        </Button>
      </div>
      <div className="h-1 bg-secondary">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default HackathonTimerBar;
