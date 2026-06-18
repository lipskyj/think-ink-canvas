import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHackathon } from "@/contexts/HackathonContext";
import { useProject } from "@/contexts/ProjectContext";
import type { BlockKey } from "@/lib/hackathon";
import { LSD_FALLBACK, type LSDContent } from "@/content/lsd-fallback";

interface State {
  content: LSDContent;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

function hashKey(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

// Build a context snapshot from saved step data (used to personalize SEE/DO).
function buildContext(getStepData: (k: string) => any) {
  const pov = getStepData("pov_statement");
  const empathy = getStepData("empathy_map");
  const hmwData = getStepData("how_might_we");
  return {
    user: pov?.user || empathy?.userDesc || undefined,
    need: pov?.need || undefined,
    insight: pov?.insight || undefined,
    hmw: hmwData?.questions?.[0] || undefined,
    problem: getStepData("five_whys")?.problem || undefined,
  };
}

export function useLearnSeeDo(phase: BlockKey) {
  const { state: hack, setLsdCache } = useHackathon();
  const { getStepData } = useProject();

  const theme = hack.theme || "";
  const ctx = buildContext(getStepData);
  const ctxSig = hashKey(
    JSON.stringify({ phase, theme, ctx })
  );

  const cached = hack.lsdCache?.[phase];
  const initial: State =
    cached && cached.sig === ctxSig
      ? { content: cached.content, loading: false, error: null, isFallback: false }
      : { content: LSD_FALLBACK[phase], loading: true, error: null, isFallback: true };

  const [state, setState] = useState<State>(initial);

  const fetchLSD = useCallback(
    async (force = false) => {
      if (!force && cached && cached.sig === ctxSig) {
        setState({ content: cached.content, loading: false, error: null, isFallback: false });
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const { data, error } = await supabase.functions.invoke("learn-see-do", {
          body: { phase, theme, context: ctx },
        });
        if (error) throw error;
        const lsd = data?.lsd as LSDContent | undefined;
        if (!lsd || !lsd.learn || !lsd.see || !lsd.do) throw new Error("bad response");
        setState({ content: lsd, loading: false, error: null, isFallback: false });
        setLsdCache(phase, { sig: ctxSig, content: lsd });
      } catch (e) {
        setState({
          content: LSD_FALLBACK[phase],
          loading: false,
          error: e instanceof Error ? e.message : "error",
          isFallback: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, ctxSig]
  );

  useEffect(() => {
    if (cached && cached.sig === ctxSig) return;
    fetchLSD(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxSig]);

  return { ...state, regenerate: () => fetchLSD(true) };
}
