import { Check, Home, Lock, Settings, Users, LogOut, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { STEPS, PHASES } from "@/lib/steps";
import { useProject } from "@/contexts/ProjectContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useClass } from "@/contexts/ClassContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { isStepCompleted } = useProject();
  const { isStepLocked } = useAdmin();
  const { session, isClassMode, clearSession } = useClass();
  const navigate = useNavigate();

  const handleLogout = () => {
    const classId = session?.classId;
    clearSession();
    navigate(classId ? `/join/${classId}` : "/");
  };

  return (
    <Sidebar className="border-l-2 border-foreground" side="right">
      <SidebarContent className="pt-5 bg-background/95 backdrop-blur-md">
        {/* Brand */}
        <div className="px-5 pb-5 border-b-2 border-foreground/15">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-5 w-5" strokeWidth={2.5} />
            <span className="pill-chip pill-chip-coral text-[10px]">ערכת חש״ע</span>
          </div>
          <h1 className="display-huge leading-none" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)" }}>
            חשוב.<br/>צור.<br/>שבור.
          </h1>
        </div>

        {isClassMode && session && (
          <div className="mx-4 mt-4 p-3 sketch-border-thin bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4" />
              <span className="font-sketch text-base">{session.className}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-hand">{session.studentName}</p>
            <button
              onClick={handleLogout}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-sketch uppercase tracking-wider"
            >
              <LogOut className="h-3 w-3" /> יציאה
            </button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    className="rounded-md px-3 py-2.5 flex items-center gap-2.5 font-sketch text-base hover:bg-accent/40 transition-colors"
                    activeClassName="bg-foreground text-background"
                  >
                    <Home className="h-4 w-4" />
                    <span>סקירה כללית</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {PHASES.map((phase, phaseIdx) => {
          const phaseSteps = STEPS.filter((s) => s.phase === phase.key);
          return (
            <SidebarGroup key={phase.key}>
              <SidebarGroupLabel className="font-sketch text-[11px] uppercase tracking-[0.18em] text-foreground/60 px-5 mt-2">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-5 h-px bg-foreground/40" />
                  {String(phaseIdx + 1).padStart(2, "0")} · {phase.title}
                </span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {phaseSteps.map((step) => {
                    const completed = isStepCompleted(step.key);
                    const locked = isClassMode && isStepLocked(step.key);
                    const Icon = step.icon;

                    return (
                      <SidebarMenuItem key={step.key}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={step.url}
                            className="rounded-md px-3 py-2 flex items-center gap-2.5 font-sketch text-[15px] hover:bg-accent/40 transition-colors"
                            activeClassName="bg-foreground text-background shadow-[3px_3px_0_hsl(var(--primary))]"
                          >
                            {locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : completed ? (
                              <Check className="h-4 w-4 text-[hsl(var(--highlight))]" strokeWidth={3} />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                            <span className="tabular-nums text-foreground/50 text-xs mr-0.5">
                              {String(step.num).padStart(2, "0")}
                            </span>
                            <span className="truncate">{step.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {!isClassMode && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="rounded-md px-3 py-2 flex items-center gap-2.5 font-sketch text-sm text-muted-foreground hover:text-foreground transition-colors"
                      activeClassName="bg-foreground text-background"
                    >
                      <Settings className="h-4 w-4" />
                      <span>ניהול</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
