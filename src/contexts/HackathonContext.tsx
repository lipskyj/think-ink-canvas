import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  loadHackathonState,
  saveHackathonState,
  type HackathonState,
  type BlockKey,
  type TeamRole,
  type LsdCacheEntry,
  DEFAULT_STATE,
  SPRINT_BLOCKS,
} from "@/lib/hackathon";

interface Ctx {
  state: HackathonState;
  remainingSec: number;
  enableMode: (opts?: { durationMin?: number; teamSize?: number; myRole?: TeamRole; teamName?: string; theme?: string }) => void;
  disableMode: () => void;
  setCurrentBlock: (b: BlockKey) => void;
  setRole: (r: TeamRole) => void;
  resetTimer: () => void;
  setTheme: (t: string) => void;
  setLsdCache: (phase: BlockKey, entry: LsdCacheEntry) => void;
}

const HackathonContext = createContext<Ctx>({
  state: DEFAULT_STATE,
  remainingSec: 0,
  enableMode: () => {},
  disableMode: () => {},
  setCurrentBlock: () => {},
  setRole: () => {},
  resetTimer: () => {},
  setTheme: () => {},
  setLsdCache: () => {},
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
      theme: opts?.theme ?? s.theme,
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

  const setTheme = useCallback((t: string) => {
    setState((s) => ({ ...s, theme: t }));
  }, []);

  const setLsdCache = useCallback((phase: BlockKey, entry: LsdCacheEntry) => {
    setState((s) => ({ ...s, lsdCache: { ...s.lsdCache, [phase]: entry } }));
  }, []);

  return (
    <HackathonContext.Provider
      value={{ state, remainingSec, enableMode, disableMode, setCurrentBlock, setRole, resetTimer, setTheme, setLsdCache }}
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
