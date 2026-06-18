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
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir="rtl">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <HackathonTimerBar />
          <header className="h-12 flex items-center border-b border-foreground/20 px-4">
            <SidebarTrigger />
            <span className="mr-3 font-sketch text-sm text-muted-foreground">ערכת חשיבה עיצובית</span>
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
