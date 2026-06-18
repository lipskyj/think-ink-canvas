import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const CLASS_SESSION_KEY = "dt-toolkit-class-session";

interface ClassSession {
  classId: string;
  className: string;
  studentName: string;
  isLeader?: boolean;
}

interface ClassContextType {
  session: ClassSession | null;
  setSession: (session: ClassSession) => void;
  clearSession: () => void;
  isClassMode: boolean;
  isLeader: boolean;
}

const ClassContext = createContext<ClassContextType>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
  isClassMode: false,
  isLeader: false,
});

function loadSession(): ClassSession | null {
  try {
    const raw = localStorage.getItem(CLASS_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function ClassProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<ClassSession | null>(loadSession);

  useEffect(() => {
    if (session) {
      localStorage.setItem(CLASS_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(CLASS_SESSION_KEY);
    }
  }, [session]);

  const setSession = useCallback((s: ClassSession) => setSessionState(s), []);
  const clearSession = useCallback(() => setSessionState(null), []);

  return (
    <ClassContext.Provider value={{
      session,
      setSession,
      clearSession,
      isClassMode: !!session,
      isLeader: !!session?.isLeader,
    }}>
      {children}
    </ClassContext.Provider>
  );
}

export const useClass = () => useContext(ClassContext);
