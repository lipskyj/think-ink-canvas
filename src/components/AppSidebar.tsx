import { Check, Home, Lock, Settings, Users, LogOut } from "lucide-react";
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
import { FlaskConical } from "lucide-react";

export function AppSidebar() {
  const { isStepCompleted } = useProject();
  const { isStepLocked } = useAdmin();
  const { session, isClassMode, clearSession } = useClass();
  const navigate = useNavigate();

  const handleLogout = () => {
    const classId = session?.classId;
    clearSession();
    if (classId) {
      navigate(`/join/${classId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <Sidebar className="border-l-2 border-foreground/20" side="right">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-4 border-b-2 border-foreground/20">
          <h1 className="font-sketch text-xl flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            ערכת חש״ע
          </h1>
          <p className="text-xs text-muted-foreground font-hand text-lg mt-1">חשוב → צור → שבור → חזור</p>
        </div>

        {isClassMode && session && (
          <div className="mx-4 mt-3 p-3 border border-border rounded-sm bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4" />
              <span className="font-sketch text-sm">{session.className}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">👤 {session.studentName}</p>
            <button
              onClick={handleLogout}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3 w-3" /> יציאה מהכיתה
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
                    className="hover:bg-accent/50 rounded-sm px-3 py-2 flex items-center gap-2 text-sm"
                    activeClassName="bg-foreground text-primary-foreground font-medium"
                  >
                    <Home className="h-4 w-4" />
                    <span className="font-sketch">סקירה כללית</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {PHASES.map((phase) => {
          const phaseSteps = STEPS.filter((s) => s.phase === phase.key);
          return (
            <SidebarGroup key={phase.key}>
              <SidebarGroupLabel className="font-sketch text-xs uppercase tracking-widest">
                {phase.emoji} {phase.title}
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
                            className="hover:bg-accent/50 rounded-sm px-3 py-2 flex items-center gap-2 text-sm"
                            activeClassName="bg-foreground text-primary-foreground font-medium"
                          >
                            {locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : completed ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                            <span className="font-sketch">{step.num}. {step.title}</span>
                            {locked && <span className="mr-auto text-xs">🔒</span>}
                            {!locked && completed && <span className="mr-auto text-xs">✓</span>}
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
                      className="hover:bg-accent/50 rounded-sm px-3 py-2 flex items-center gap-2 text-sm"
                      activeClassName="bg-foreground text-primary-foreground font-medium"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-sketch">ניהול</span>
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
