import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import UnstuckButton from "@/components/UnstuckButton";
import { useHackathon } from "@/contexts/HackathonContext";
import { formatHMS, SPRINT_BLOCKS } from "@/lib/hackathon";
import { Timer, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { state, remainingSec, enableMode, resetTimer } = useHackathon();
  const timerOn = state.enabled;
  const totalSec = state.durationMin * 60;
  const pct = timerOn ? Math.max(0, Math.min(100, (remainingSec / totalSec) * 100)) : 0;
  const low = remainingSec < 30 * 60;
  const critical = remainingSec < 10 * 60;
  const block = SPRINT_BLOCKS.find((b) => b.key === state.currentBlock);
  const barColor = critical ? "bg-red-500" : low ? "bg-amber-500" : "bg-emerald-500";

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="vibe-backdrop" aria-hidden>
        <span className="vibe-blob-3" />
        <span className="vibe-blob-4" />
      </div>

      <div className="min-h-screen flex w-full relative z-10" dir="rtl">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="sticky top-0 z-40 border-b-2 border-foreground/15 bg-background/95 backdrop-blur">
            <header className="min-h-12 flex items-center px-4 gap-2 flex-nowrap whitespace-nowrap overflow-x-auto">
              <SidebarTrigger title="מפת כל השלבים" />
              <span className="font-sketch text-base tracking-tight shrink-0">מפת השלבים</span>
              {timerOn && (
                <>
                  <Timer size={16} className={critical ? "text-red-500 animate-pulse shrink-0" : "text-foreground shrink-0"} />
                  <span className="font-mono font-bold tabular-nums text-sm shrink-0">{formatHMS(remainingSec)}</span>
                  {block && (
                    <span className="text-muted-foreground hidden md:inline shrink-0 text-xs">
                      {block.emoji} {block.title}
                    </span>
                  )}
                  {!state.startedAt && (
                    <Button size="sm" variant="outline" onClick={() => enableMode()} className="h-7 shrink-0">
                      <Play size={12} /> התחל
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={resetTimer} className="h-7 shrink-0" title="אפס טיימר">
                    <RotateCcw size={12} />
                  </Button>
                </>
              )}
              <div id="step-toolbar-slot" className="flex items-center gap-2 flex-nowrap mr-auto" />
            </header>
            {timerOn && (
              <div className="h-1 bg-secondary">
                <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </div>
        </main>
        {state.enabled && <UnstuckButton />}
      </div>
    </SidebarProvider>
  );
};

export default Layout;
