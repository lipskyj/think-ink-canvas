import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { useHackathon } from "@/contexts/HackathonContext";
import { STEPS } from "@/lib/steps";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Play, Pause, RotateCcw, Mic, Download, FileText, ArrowRight, Volume2, Image as ImageIcon, ExternalLink } from "lucide-react";
import PitchStylePicker from "@/components/PitchStylePicker";
import { getPitchStyle, PitchStyleKey } from "@/lib/pitchStyles";
import { buildPitchDeck } from "@/lib/pitchDeck";

interface Slide {
  title: string;
  subtitle?: string;
  bullets: string[];
  visualHint?: string;
}

interface PitchData {
  script: string;
  slides: Slide[];
  judging: { criterion: string; question: string }[];
  speakerNotes?: string[];
  styleKey?: PitchStyleKey;
}

const STORAGE = "hackathon-pitch-v2";

const Pitch = () => {
  const { getStepData, saveStepData } = useProject();
  const { state: hackState } = useHackathon();
  const { toast } = useToast();
  const [styleKey, setStyleKey] = useState<PitchStyleKey | null>(null);
  const [pitch, setPitch] = useState<PitchData | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [practice, setPractice] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPitch(parsed);
        if (parsed.styleKey) setStyleKey(parsed.styleKey);
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
      }
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
    if (!styleKey) {
      toast({ title: "בחרו סגנון פיץ׳ קודם", variant: "destructive" });
      return;
    }
    const style = getPitchStyle(styleKey);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          mode: "pitch_generate",
          stepKey: "pitch",
          stepTitle: "Pitch",
          previousData: collectAll(),
          pitchStyle: style.key,
          pitchStyleTitle: style.title,
          pitchStyleHint: style.promptHint,
          pitchSlideTitles: style.slideTitles,
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
        const withStyle = { ...parsed, styleKey };
        setPitch(withStyle);
        localStorage.setItem(STORAGE, JSON.stringify(withStyle));
        saveStepData("pitch", withStyle, true);
        toast({ title: "הפיץ׳ מוכן! " });
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

  const downloadPptx = async () => {
    if (!pitch) return;
    try {
      const style = getPitchStyle(styleKey);
      await buildPitchDeck(
        pitch,
        hackState.teamName || "הצוות",
        `${style.emoji} ${style.title}`,
        undefined,
        coverImage || undefined,
      );
      toast({ title: "המצגת ירדה! 📊" });
    } catch (e: any) {
      toast({ title: "שגיאה בייצור המצגת", description: e.message, variant: "destructive" });
    }
  };

  const openInGoogleSlides = async () => {
    if (!pitch) return;
    await downloadPptx();
    setTimeout(() => {
      window.open("https://drive.google.com/drive/u/0/my-drive", "_blank");
      toast({
        title: "פתח ב-Google Slides ",
        description: "1. הקובץ ירד למחשב. 2. גררו אותו לחלון Drive שנפתח. 3. לחצו עליו → 'פתח באמצעות' → Google Slides.",
        duration: 12000,
      });
    }, 800);
  };

  const generateCoverImage = async () => {
    if (!pitch) return;
    setImgLoading(true);
    try {
      const seed = pitch.slides[0]?.title || pitch.script.slice(0, 80);
      const allData = collectAll();
      const problem =
        (allData["POV Statement"] as any)?.user ||
        (allData["Empathy Map"] as any)?.user ||
        seed;
      const prompt = `Hand-drawn black ink sketch illustration representing: ${seed}. Context: ${typeof problem === "string" ? problem : seed}. Single bold conceptual image, no text.`;
      const { data, error } = await supabase.functions.invoke("pitch-image", {
        body: { prompt },
      });
      if (error) throw error;
      const url = data?.imageUrl as string | undefined;
      if (!url) throw new Error("No image returned");
      setCoverImage(url);
      const updated = { ...pitch, coverImage: url, styleKey };
      localStorage.setItem(STORAGE, JSON.stringify(updated));
      saveStepData("pitch", updated, true);
      toast({ title: "תמונת שער מוכנה! 🖼️" });
    } catch (e: any) {
      toast({ title: "שגיאה בייצור תמונה", description: e.message, variant: "destructive" });
    } finally {
      setImgLoading(false);
    }
  };


  const speak = () => {
    if (!pitch) return;
    try {
      const u = new SpeechSynthesisUtterance(pitch.script);
      u.lang = "he-IL";
      u.rate = 1.05;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      toast({ title: "הדפדפן לא תומך בהקראה", variant: "destructive" });
    }
  };

  const style = getPitchStyle(styleKey);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
        <div className="text-center">
          <h1 className="font-sketch text-4xl mb-2">הפיץ׳</h1>
          <p className="font-hand text-xl text-muted-foreground">
            60 שניות. מצגת אמיתית. שופטים מרוצים.
          </p>
        </div>


        {/* Step 1: pick style */}
        <div className="sketch-card p-5">
          <PitchStylePicker selected={styleKey} onSelect={setStyleKey} />
        </div>

        {/* Step 2: generate */}
        <div className="sketch-card p-5 bg-secondary/20">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={generate} disabled={loading || !styleKey} size="lg">
              <Sparkles size={16} />{" "}
              {loading
                ? "מייצר…"
                : pitch
                ? `ייצור מחדש בסגנון ${style.title}`
                : "צרו פיץ׳ מהעבודה שלכם"}
            </Button>
            {!styleKey && (
              <span className="font-hand text-sm text-muted-foreground">
                <ArrowRight size={14} className="inline rotate-180 ml-1" />
                בחרו סגנון למעלה
              </span>
            )}
          </div>
          <p className="font-hand text-sm text-muted-foreground mt-2">
            ה-AI לוקח את כל מה שעשיתם — בעיה, פתרון, תובנה — ובונה לכם סקריפט, 5-7 שקפים, צ׳קליסט שיפוט והערות למרצה.
          </p>
        </div>

        {pitch && (
          <>
            {/* Export bar */}
            <div className="sketch-card p-4 flex items-center gap-2 flex-wrap bg-foreground text-background">
              <span className="font-sketch text-base ml-2">ייצוא:</span>
              <Button variant="secondary" size="sm" onClick={downloadPptx}>
                <Download size={14} /> הורדה כ-PowerPoint
              </Button>
              <Button variant="secondary" size="sm" onClick={openInGoogleSlides}>
                <ExternalLink size={14} /> פתח ב-Google Slides
              </Button>
              <Button variant="secondary" size="sm" onClick={copyAll}>
                <FileText size={14} /> Markdown
              </Button>
              <Button variant="secondary" size="sm" onClick={speak}>
                <Volume2 size={14} /> תקריא לי
              </Button>
            </div>

            {/* Cover image */}
            <div className="sketch-card p-4">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <ImageIcon size={18} />
                <h2 className="font-sketch text-lg">תמונת שער למצגת</h2>
                <div className="flex-1" />
                <Button size="sm" variant="outline" onClick={generateCoverImage} disabled={imgLoading}>
                  <Sparkles size={14} /> {imgLoading ? "מייצר…" : coverImage ? "ייצור מחדש" : "ייצרו תמונה"}
                </Button>
              </div>
              {coverImage ? (
                <img src={coverImage} alt="תמונת שער" className="w-full max-h-72 object-contain bg-secondary/20 rounded" />
              ) : (
                <p className="font-hand text-sm text-muted-foreground">
                  AI יצייר לכם איור בסגנון הזין של האפליקציה — ישובץ אוטומטית במצגת.
                </p>
              )}
            </div>


            {/* Script + practice timer */}
            <div className="sketch-card p-5 border-2 border-foreground">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Mic size={18} />
                <h2 className="font-sketch text-xl">סקריפט 60 שניות</h2>
                <div className="flex-1" />
                <span className="font-mono text-2xl tabular-nums">{practice}s</span>
                <Button size="sm" variant="outline" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRunning(false);
                    setPractice(60);
                  }}
                >
                  <RotateCcw size={14} />
                </Button>
              </div>
              <div className="font-hand text-xl leading-relaxed whitespace-pre-wrap p-4 bg-secondary/30 rounded">
                {pitch.script}
              </div>
            </div>

            {/* Slides outline */}
            <div>
              <h2 className="font-sketch text-2xl mb-3">
                📊 שלד מצגת — {pitch.slides.length} שקפים
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {pitch.slides.map((s, i) => (
                  <div key={i} className="sketch-card p-4">
                    <div className="text-xs text-muted-foreground font-hand mb-1">שקף {i + 1}</div>
                    <h3 className="font-sketch text-lg mb-1">{s.title}</h3>
                    {s.subtitle && (
                      <p className="font-hand text-sm text-muted-foreground mb-2">{s.subtitle}</p>
                    )}
                    <ul className="font-hand text-base space-y-1">
                      {s.bullets.map((b, j) => (
                        <li key={j}>• {b}</li>
                      ))}
                    </ul>
                    {s.visualHint && (
                      <p className="font-hand text-xs italic text-muted-foreground mt-2 pt-2 border-t border-dashed">
                        🎨 {s.visualHint}
                      </p>
                    )}
                    {pitch.speakerNotes?.[i] && (
                      <p className="font-hand text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                        🗣️ {pitch.speakerNotes[i]}
                      </p>
                    )}
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
