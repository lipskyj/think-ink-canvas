// Per-step Learn → See content. Step-keyed cache via localStorage.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHackathon } from "@/contexts/HackathonContext";
import { useProject } from "@/contexts/ProjectContext";
import { getStepByKey } from "@/lib/steps";

export interface LSDStepContent {
  learn: string;
  see: { context: string; execution: string };
}

interface State {
  content: LSDStepContent | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

const CACHE_PREFIX = "lsd-step-cache-v1:";

function hashKey(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

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

function fallbackFor(stepKey: string): LSDStepContent {
  const step = getStepByKey(stepKey);
  return {
    learn:
      step?.whyItMatters ||
      step?.description ||
      "השלב הזה מקרב אתכם בצעד אחד לפתרון אמיתי. תתחילו, תזרמו, תתקנו תוך כדי תנועה.",
    see: {
      context: "צוות בהאקתון תיכון שעבד על אותו אתגר.",
      execution:
        step?.description ||
        "הם פתחו את הדף, מילאו את השדות בצורה ספציפית ומוחשית, ועברו הלאה — בלי לחפש שלמות.",
    },
  };
}

export function useStepLSD(stepKey: string, enabled: boolean) {
  const { state: hack } = useHackathon();
  const { getStepData } = useProject();

  const step = getStepByKey(stepKey);
  const theme = hack.theme || "";
  const ctx = buildContext(getStepData);
  const sig = hashKey(JSON.stringify({ stepKey, theme, ctx }));
  const cacheKey = CACHE_PREFIX + stepKey;

  const readCache = (): { sig: string; content: LSDStepContent } | null => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const cached = readCache();
  const initial: State =
    cached && cached.sig === sig
      ? { content: cached.content, loading: false, error: null, isFallback: false }
      : { content: null, loading: true, error: null, isFallback: false };

  const [state, setState] = useState<State>(initial);

  const fetchLSD = useCallback(
    async (force = false) => {
      if (!step) return;
      const fresh = readCache();
      if (!force && fresh && fresh.sig === sig) {
        setState({ content: fresh.content, loading: false, error: null, isFallback: false });
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const { data, error } = await supabase.functions.invoke("learn-see-do", {
          body: {
            stepKey,
            stepTitle: step.title,
            stepDescription: step.description,
            whyItMatters: step.whyItMatters,
            theme,
            context: ctx,
          },
        });
        if (error) throw error;
        const lsd = data?.lsd as LSDStepContent | undefined;
        if (!lsd || !lsd.learn || !lsd.see) throw new Error("bad response");
        setState({ content: lsd, loading: false, error: null, isFallback: false });
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ sig, content: lsd }));
        } catch {}
      } catch (e) {
        setState({
          content: fallbackFor(stepKey),
          loading: false,
          error: e instanceof Error ? e.message : "error",
          isFallback: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepKey, sig]
  );

  useEffect(() => {
    if (!enabled) return;
    const fresh = readCache();
    if (fresh && fresh.sig === sig) {
      setState({ content: fresh.content, loading: false, error: null, isFallback: false });
      return;
    }
    fetchLSD(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, enabled]);

  return { ...state, regenerate: () => fetchLSD(true) };
}
