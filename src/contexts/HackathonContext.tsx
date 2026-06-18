import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  loadHackathonState,
  saveHackathonState,
  type HackathonState,
  type BlockKey,
  type TeamRole,
  DEFAULT_STATE,
  SPRINT_BLOCKS,
} from "@/lib/hackathon";

interface Ctx {
  state: HackathonState;
  remainingSec: number;
  enableMode: (opts?: { durationMin?: number; teamSize?: number; myRole?: TeamRole; teamName?: string }) => void;
  disableMode: () => void;
  setCurrentBlock: (b: BlockKey) => void;
  setRole: (r: TeamRole) => void;
  resetTimer: () => void;
}

const HackathonContext = createContext<Ctx>({
  state: DEFAULT_STATE,
  remainingSec: 0,
  enableMode: () => {},
  disableMode: () => {},
  setCurrentBlock: () => {},
  setRole: () => {},
  resetTimer: () => {},
});

export function HackathonProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HackathonState>(() => loadHackathonState());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    saveHackathonState(state);
  }, [state]);

  useEffect(() => {
    if (!state.enabled || !state.startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.enabled, state.startedAt]);

  const remainingSec = state.startedAt
    ? Math.floor((state.startedAt + state.durationMin * 60_000 - now) / 1000)
    : state.durationMin * 60;

  const enableMode = useCallback<Ctx["enableMode"]>((opts) => {
    setState((s) => ({
      ...s,
      enabled: true,
      startedAt: s.startedAt ?? Date.now(),
      durationMin: opts?.durationMin ?? s.durationMin,
      teamSize: opts?.teamSize ?? s.teamSize,
      myRole: opts?.myRole ?? s.myRole,
      teamName: opts?.teamName ?? s.teamName,
    }));
  }, []);

  const disableMode = useCallback(() => {
    setState((s) => ({ ...s, enabled: false }));
  }, []);

  const setCurrentBlock = useCallback((b: BlockKey) => {
    setState((s) => ({ ...s, currentBlock: b }));
  }, []);

  const setRole = useCallback((r: TeamRole) => {
    setState((s) => ({ ...s, myRole: r }));
  }, []);

  const resetTimer = useCallback(() => {
    setState((s) => ({ ...s, startedAt: Date.now() }));
    setNow(Date.now());
  }, []);

  return (
    <HackathonContext.Provider
      value={{ state, remainingSec, enableMode, disableMode, setCurrentBlock, setRole, resetTimer }}
    >
      {children}
    </HackathonContext.Provider>
  );
}

export const useHackathon = () => useContext(HackathonContext);

// Helper: which block contains a given step
export function blockOfStep(stepKey: string): BlockKey | null {
  for (const b of SPRINT_BLOCKS) {
    if (b.subSteps.some((s) => s.stepKey === stepKey)) return b.key;
  }
  return null;
}
