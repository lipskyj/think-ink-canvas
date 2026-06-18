import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { STEPS } from "@/lib/steps";
import { useClass } from "@/contexts/ClassContext";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_STORAGE_KEY = "dt-toolkit-admin";

interface AdminSettings {
  aiEnabled: boolean;
  lockedSteps: Record<string, boolean>;
}

interface AdminContextType {
  aiEnabled: boolean;
  toggleAI: () => void;
  isStepLocked: (stepKey: string) => boolean;
  toggleStepLock: (stepKey: string) => void;
  lockAllSteps: () => void;
  unlockAllSteps: () => void;
  // For admin page: update a specific class's settings
  updateClassSettings: (classId: string, settings: { aiEnabled?: boolean; lockedSteps?: Record<string, boolean> }) => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  aiEnabled: true,
  toggleAI: () => {},
  isStepLocked: () => false,
  toggleStepLock: () => {},
  lockAllSteps: () => {},
  unlockAllSteps: () => {},
  updateClassSettings: async () => {},
});

function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { aiEnabled: true, lockedSteps: {} };
}

function saveSettings(s: AdminSettings) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(s));
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { session, isClassMode, isLeader } = useClass();
  const [localSettings, setLocalSettings] = useState<AdminSettings>(loadSettings);
  const [classSettings, setClassSettings] = useState<AdminSettings>({ aiEnabled: true, lockedSteps: {} });

  // Save local settings
  useEffect(() => { saveSettings(localSettings); }, [localSettings]);

  // Load class settings when in class mode + subscribe to realtime changes + polling fallback
  useEffect(() => {
    if (!isClassMode || !session) return;
    let isActive = true;
    let pollTimer: ReturnType<typeof setTimeout>;
    let pollInterval = 3000; // Start at 3s

    const fetchSettings = async () => {
      try {
        console.log("[AdminContext] Polling class settings for:", session.classId);
        const { data, error } = await supabase
          .from("classes")
          .select("ai_enabled, locked_steps")
          .eq("id", session.classId)
          .single();
        if (error) {
          console.error("[AdminContext] Fetch error:", error);
          return;
        }
        if (data && isActive) {
          console.log("[AdminContext] Got settings:", { ai_enabled: data.ai_enabled, locked_steps: data.locked_steps });
          setClassSettings({
            aiEnabled: data.ai_enabled ?? true,
            lockedSteps: (data.locked_steps as Record<string, boolean>) ?? {},
          });
        }
      } catch (err) {
        console.error("[AdminContext] Failed to fetch class settings:", err);
      }
    };

    // Initial fetch
    fetchSettings();

    // Polling fallback — always poll every few seconds for reliability
    const startPolling = () => {
      if (!isActive) return;
      pollTimer = setTimeout(async () => {
        await fetchSettings();
        if (isActive) startPolling();
      }, pollInterval);
    };
    startPolling();

    // Refetch on window focus
    const handleFocus = () => fetchSettings();
    window.addEventListener("focus", handleFocus);
    // Also refetch on visibility change (tab switch back)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchSettings();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Subscribe to realtime changes on this class row
    const channel = supabase
      .channel(`class-settings-${session.classId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "classes",
          filter: `id=eq.${session.classId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (isActive) {
            setClassSettings({
              aiEnabled: row.ai_enabled ?? true,
              lockedSteps: (row.locked_steps as Record<string, boolean>) ?? {},
            });
          }
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      clearTimeout(pollTimer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [isClassMode, session?.classId]);

  // Active settings depend on mode
  const settings = isClassMode ? classSettings : localSettings;
  const setSettings = isClassMode
    ? setClassSettings
    : setLocalSettings;

  const persistClassSettings = useCallback(async (newSettings: AdminSettings) => {
    if (!session) return;
    await supabase.from("classes").update({
      ai_enabled: newSettings.aiEnabled,
      locked_steps: newSettings.lockedSteps,
    }).eq("id", session.classId);
  }, [session]);

  const toggleAI = useCallback(() => {
    // In class mode, only the group leader may toggle AI for the group
    if (isClassMode && !isLeader) return;
    setSettings((s) => {
      const next = { ...s, aiEnabled: !s.aiEnabled };
      if (isClassMode) persistClassSettings(next);
      return next;
    });
  }, [isClassMode, isLeader, persistClassSettings, setSettings]);

  const isStepLocked = useCallback((stepKey: string) => {
    return settings.lockedSteps[stepKey] === true;
  }, [settings.lockedSteps]);

  const toggleStepLock = useCallback((stepKey: string) => {
    setSettings((s) => {
      const next = { ...s, lockedSteps: { ...s.lockedSteps, [stepKey]: !s.lockedSteps[stepKey] } };
      if (isClassMode) persistClassSettings(next);
      return next;
    });
  }, [isClassMode, persistClassSettings, setSettings]);

  const lockAllSteps = useCallback(() => {
    const locked: Record<string, boolean> = {};
    STEPS.forEach((s) => { locked[s.key] = true; });
    setSettings((s) => {
      const next = { ...s, lockedSteps: locked };
      if (isClassMode) persistClassSettings(next);
      return next;
    });
  }, [isClassMode, persistClassSettings, setSettings]);

  const unlockAllSteps = useCallback(() => {
    setSettings((s) => {
      const next = { ...s, lockedSteps: {} };
      if (isClassMode) persistClassSettings(next);
      return next;
    });
  }, [isClassMode, persistClassSettings, setSettings]);

  const updateClassSettings = useCallback(async (classId: string, updates: { aiEnabled?: boolean; lockedSteps?: Record<string, boolean> }) => {
    const updateData: any = {};
    if (updates.aiEnabled !== undefined) updateData.ai_enabled = updates.aiEnabled;
    if (updates.lockedSteps !== undefined) updateData.locked_steps = updates.lockedSteps;
    await supabase.from("classes").update(updateData).eq("id", classId);
  }, []);

  return (
    <AdminContext.Provider value={{
      aiEnabled: settings.aiEnabled,
      toggleAI,
      isStepLocked,
      toggleStepLock,
      lockAllSteps,
      unlockAllSteps,
      updateClassSettings,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
