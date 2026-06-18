import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import HackathonTimerBar from "@/components/HackathonTimerBar";
import UnstuckButton from "@/components/UnstuckButton";
import { useHackathon } from "@/contexts/HackathonContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { state } = useHackathon();
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="vibe-backdrop" aria-hidden>
        <span className="vibe-blob-3" />
        <span className="vibe-blob-4" />
      </div>

      <div className="min-h-screen flex w-full relative z-10" dir="rtl">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <HackathonTimerBar />
          <header className="h-14 flex items-center border-b-2 border-foreground/15 px-5 gap-3 backdrop-blur-sm bg-background/60">
            <SidebarTrigger title="מפת כל השלבים" />
            <span className="font-sketch text-base tracking-tight">מפת השלבים</span>
            <span className="mr-auto pill-chip pill-chip-outline">ערכת חשיבה עיצובית</span>
          </header>
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
