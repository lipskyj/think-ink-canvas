import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { STEPS, getStepIndex } from "@/lib/steps";
import { useToast } from "@/hooks/use-toast";
import { useClass } from "@/contexts/ClassContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "dt-toolkit-data";
const CLASS_COMPLETION_KEY_PREFIX = "dt-toolkit-class-completion";

interface StepDataEntry {
  step_key: string;
  data: any;
  completed: boolean;
}

interface ProjectContextType {
  stepData: Record<string, StepDataEntry>;
  isLoading: boolean;
  saveStepData: (stepKey: string, data: any, silent?: boolean) => Promise<void>;
  completeStep: (stepKey: string) => Promise<void>;
  uncompleteStep: (stepKey: string) => Promise<void>;
  isStepUnlocked: (stepKey: string) => boolean;
  isStepCompleted: (stepKey: string) => boolean;
  getStepData: (stepKey: string) => any;
  getAllPreviousData: (stepKey: string) => Record<string, any>;
  getMissingPrerequisites: (stepKey: string) => string[];
}

const ProjectContext = createContext<ProjectContextType>({
  stepData: {},
  isLoading: false,
  saveStepData: async () => {},
  completeStep: async () => {},
  uncompleteStep: async () => {},
  isStepUnlocked: () => true,
  isStepCompleted: () => false,
  getStepData: () => null,
  getAllPreviousData: () => ({}),
  getMissingPrerequisites: () => [],
});

function loadFromStorage(): Record<string, StepDataEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading from localStorage:", e);
  }
  return {};
}

function saveToStorage(data: Record<string, StepDataEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

function getClassCompletionStorageKey(classId: string, studentName: string) {
  return `${CLASS_COMPLETION_KEY_PREFIX}:${classId}:${studentName}`;
}

function loadClassCompletion(classId: string, studentName: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(getClassCompletionStorageKey(classId, studentName));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading class completion from localStorage:", e);
  }
  return {};
}

function saveClassCompletion(classId: string, studentName: string, completion: Record<string, boolean>) {
  try {
    localStorage.setItem(getClassCompletionStorageKey(classId, studentName), JSON.stringify(completion));
  } catch (e) {
    console.error("Error saving class completion to localStorage:", e);
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { session, isClassMode } = useClass();
  const [stepData, setStepData] = useState<Record<string, StepDataEntry>>(() =>
    isClassMode ? {} : loadFromStorage()
  );
  const [classCompletion, setClassCompletion] = useState<Record<string, boolean>>({});
  const stepDataRef = useRef<Record<string, StepDataEntry>>(stepData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    stepDataRef.current = stepData;
  }, [stepData]);

  useEffect(() => {
    if (!isClassMode || !session) {
      setClassCompletion({});
      return;
    }
    setClassCompletion(loadClassCompletion(session.classId, session.studentName));
  }, [isClassMode, session?.classId, session?.studentName]);

  useEffect(() => {
    if (!isClassMode || !session) return;
    saveClassCompletion(session.classId, session.studentName, classCompletion);
  }, [isClassMode, session?.classId, session?.studentName, classCompletion]);

  useEffect(() => {
    if (!isClassMode) return;
    setStepData((prev) => {
      const next: Record<string, StepDataEntry> = {};
      Object.entries(prev).forEach(([key, entry]) => {
        next[key] = { ...entry, completed: classCompletion[key] === true };
      });
      return next;
    });
  }, [isClassMode, classCompletion]);

  // Load from DB when in class mode + realtime subscription
  useEffect(() => {
    if (!isClassMode || !session) {
      setStepData(loadFromStorage());
      return;
    }
    setIsLoading(true);
    const loadData = async () => {
      const { data: rows } = await supabase
        .from("class_step_data")
        .select("step_key, data")
        .eq("class_id", session.classId)
        .eq("student_name", session.studentName);
      const completion = loadClassCompletion(session.classId, session.studentName);
      const result: Record<string, StepDataEntry> = {};
      if (rows) {
        rows.forEach((r) => {
          result[r.step_key] = {
            step_key: r.step_key,
            data: r.data as any,
            completed: completion[r.step_key] === true,
          };
        });
      }
      setStepData(result);
      setIsLoading(false);
    };
    loadData();

    // Subscribe to realtime changes for this student in this class
    const channel = supabase
      .channel(`class-sync-${session.classId}-${session.studentName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "class_step_data",
          filter: `class_id=eq.${session.classId}`,
        },
        (payload) => {
          const changedRow = (payload.new ?? payload.old) as any;
          if (!changedRow || changedRow.student_name !== session.studentName) return;

          if (payload.eventType === "DELETE") {
            setStepData((prev) => {
              const next = { ...prev };
              delete next[changedRow.step_key];
              return next;
            });
            return;
          }

          setStepData((prev) => ({
            ...prev,
            [changedRow.step_key]: {
              step_key: changedRow.step_key,
              data: changedRow.data,
              completed: prev[changedRow.step_key]?.completed ?? false,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isClassMode, session?.classId, session?.studentName]);

  // Persist to localStorage only in non-class mode
  useEffect(() => {
    if (!isClassMode) {
      saveToStorage(stepData);
    }
  }, [stepData, isClassMode]);

  const upsertToDb = useCallback(
    async (stepKey: string, data: any, completed: boolean) => {
      if (!session) return;
      const { error } = await supabase.from("class_step_data").upsert(
        {
          class_id: session.classId,
          student_name: session.studentName,
          step_key: stepKey,
          data,
          completed,
        },
        { onConflict: "class_id,student_name,step_key" }
      );
      if (error) {
        console.error("Upsert error for", session.studentName, stepKey, error);
      }
    },
    [session]
  );

  const saveStepData = useCallback(
    async (stepKey: string, data: any, silent?: boolean) => {
      setStepData((prev) => {
        const existing = prev[stepKey];
        return {
          ...prev,
          [stepKey]: {
            step_key: stepKey,
            data,
            completed: existing?.completed ?? false,
          },
        };
      });
      if (isClassMode) {
        const existing = stepDataRef.current[stepKey];
        await upsertToDb(stepKey, data, existing?.completed ?? false);
      }
      if (!silent) {
        toast({ title: "נשמר ✓", description: "ההתקדמות שלך נשמרה." });
      }
    },
    [toast, isClassMode, upsertToDb]
  );

  const completeStep = useCallback(
    async (stepKey: string) => {
      const latestData = stepDataRef.current[stepKey]?.data ?? {};
      setStepData((prev) => ({
        ...prev,
        [stepKey]: {
          step_key: stepKey,
          data: latestData,
          completed: true,
        },
      }));
      if (isClassMode) {
        setClassCompletion((prev) => ({ ...prev, [stepKey]: true }));
        await upsertToDb(stepKey, latestData, true);
      }
      toast({ title: "השלב הושלם! 🎉" });
    },
    [toast, isClassMode, upsertToDb]
  );

  const uncompleteStep = useCallback(
    async (stepKey: string) => {
      const latestData = stepDataRef.current[stepKey]?.data ?? {};
      setStepData((prev) => {
        const existing = prev[stepKey];
        if (!existing) {
          return {
            ...prev,
            [stepKey]: {
              step_key: stepKey,
              data: latestData,
              completed: false,
            },
          };
        }
        return {
          ...prev,
          [stepKey]: { ...existing, completed: false },
        };
      });
      if (isClassMode) {
        setClassCompletion((prev) => ({ ...prev, [stepKey]: false }));
        await upsertToDb(stepKey, latestData, false);
      }
    },
    [isClassMode, upsertToDb]
  );

  const isStepUnlocked = useCallback((_stepKey: string): boolean => {
    return true;
  }, []);

  const getMissingPrerequisites = useCallback(
    (stepKey: string): string[] => {
      const idx = getStepIndex(stepKey);
      const missing: string[] = [];
      for (let i = 0; i < idx; i++) {
        if (!stepData[STEPS[i].key]?.completed) {
          missing.push(STEPS[i].title);
        }
      }
      return missing;
    },
    [stepData]
  );

  const isStepCompleted = useCallback(
    (stepKey: string): boolean => {
      return stepData[stepKey]?.completed === true;
    },
    [stepData]
  );

  const getStepData = useCallback(
    (stepKey: string): any => {
      return stepData[stepKey]?.data ?? null;
    },
    [stepData]
  );

  const getAllPreviousData = useCallback(
    (stepKey: string): Record<string, any> => {
      const idx = getStepIndex(stepKey);
      const result: Record<string, any> = {};
      for (let i = 0; i < idx; i++) {
        const key = STEPS[i].key;
        if (stepData[key]?.data) {
          result[STEPS[i].title] = stepData[key].data;
        }
      }
      return result;
    },
    [stepData]
  );

  return (
    <ProjectContext.Provider
      value={{
        stepData,
        isLoading,
        saveStepData,
        completeStep,
        uncompleteStep,
        isStepUnlocked,
        isStepCompleted,
        getStepData,
        getAllPreviousData,
        getMissingPrerequisites,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
