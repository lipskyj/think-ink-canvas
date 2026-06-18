import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { STEPS } from "@/lib/steps";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Play, Pause, RotateCcw, Mic } from "lucide-react";

interface PitchData {
  script: string;
  slides: { title: string; bullets: string[] }[];
  judging: { criterion: string; question: string }[];
}

const STORAGE = "hackathon-pitch-v1";

const Pitch = () => {
  const { getStepData, saveStepData } = useProject();
  const { toast } = useToast();
  const [pitch, setPitch] = useState<PitchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [practice, setPractice] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setPitch(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setPractice((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const collectAll = useCallback(() => {
    const all: Record<string, any> = {};
    STEPS.forEach((s) => {
      const d = getStepData(s.key);
      if (d && Object.keys(d).length) all[s.title] = d;
    });
    return all;
  }, [getStepData]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          mode: "pitch_generate",
          stepKey: "pitch",
          stepTitle: "Pitch",
          previousData: collectAll(),
        },
      });
      if (error) throw error;
      let parsed: PitchData | null = null;
      try {
        const text = data?.content || "";
        const cleaned = text.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        toast({ title: "תשובת AI לא תקינה — נסו שוב", variant: "destructive" });
      }
      if (parsed) {
        setPitch(parsed);
        localStorage.setItem(STORAGE, JSON.stringify(parsed));
        saveStepData("pitch", parsed, true);
        toast({ title: "הפיץ׳ מוכן! 🎤" });
      }
    } catch (e: any) {
      toast({ title: "שגיאה", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!pitch) return;
    const md =
      `# Pitch Script (60s)\n\n${pitch.script}\n\n# Deck Outline\n\n` +
      pitch.slides.map((s, i) => `## ${i + 1}. ${s.title}\n${s.bullets.map((b) => `- ${b}`).join("\n")}`).join("\n\n") +
      `\n\n# Judging Checklist\n\n` +
      pitch.judging.map((j) => `- **${j.criterion}**: ${j.question}`).join("\n");
    navigator.clipboard.writeText(md);
    toast({ title: "הועתק! 📋" });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
        <div className="text-center">
          <h1 className="font-sketch text-4xl mb-2">🎤 הפיץ׳</h1>
          <p className="font-hand text-xl text-muted-foreground">60 שניות, 5 שקפים, שופטים מרוצים.</p>
        </div>

        <div className="sketch-card p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={generate} disabled={loading} size="lg">
              <Sparkles size={16} /> {loading ? "מייצר…" : pitch ? "ייצור מחדש" : "צרו פיץ׳ מהעבודה שלכם"}
            </Button>
            {pitch && (
              <Button variant="outline" onClick={copyAll}>
                <Copy size={14} /> העתק הכל
              </Button>
            )}
          </div>
          <p className="font-hand text-sm text-muted-foreground mt-2">
            ה-AI לוקח את הבעיה, הפתרון והתובנה שלכם ובונה סקריפט + שקפים + צ׳קליסט שיפוט.
          </p>
        </div>

        {pitch && (
          <>
            {/* Practice timer + script teleprompter */}
            <div className="sketch-card p-5 border-2 border-foreground">
              <div className="flex items-center gap-2 mb-3">
                <Mic size={18} />
                <h2 className="font-sketch text-xl">סקריפט 60 שניות</h2>
                <div className="flex-1" />
                <span className="font-mono text-2xl tabular-nums">{practice}s</span>
                <Button size="sm" variant="outline" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setRunning(false); setPractice(60); }}>
                  <RotateCcw size={14} />
                </Button>
              </div>
              <div className="font-hand text-xl leading-relaxed whitespace-pre-wrap p-4 bg-secondary/30 rounded">
                {pitch.script}
              </div>
            </div>

            {/* Slides */}
            <div>
              <h2 className="font-sketch text-2xl mb-3">📊 שלד מצגת — 5 שקפים</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {pitch.slides.map((s, i) => (
                  <div key={i} className="sketch-card p-4">
                    <div className="text-xs text-muted-foreground font-hand mb-1">שקף {i + 1}</div>
                    <h3 className="font-sketch text-lg mb-2">{s.title}</h3>
                    <ul className="font-hand text-base space-y-1">
                      {s.bullets.map((b, j) => <li key={j}>• {b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Judging */}
            <div>
              <h2 className="font-sketch text-2xl mb-3">⚖️ צ׳קליסט שיפוט</h2>
              <div className="space-y-2">
                {pitch.judging.map((j, i) => (
                  <div key={i} className="sketch-card p-3 flex gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <div>
                      <div className="font-sketch">{j.criterion}</div>
                      <div className="font-hand text-sm text-muted-foreground">{j.question}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Pitch;
