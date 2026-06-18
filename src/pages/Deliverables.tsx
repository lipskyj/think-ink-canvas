import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { Download, Check, Circle, AlertCircle } from "lucide-react";

interface Item {
  key: string;
  title: string;
  description: string;
  url: string;
  sourceStep: string;
  check: (data: any) => "ready" | "draft" | "missing";
  extract: (data: any) => string;
}

const ITEMS: Item[] = [
  {
    key: "problem",
    title: " הצהרת בעיה",
    description: "מי המשתמש, מה הצורך, מה התובנה",
    url: "/pov",
    sourceStep: "pov_statement",
    check: (d) => (d?.user && d?.need && d?.insight ? "ready" : d ? "draft" : "missing"),
    extract: (d) => d ? `User: ${d.user || "?"}\nNeed: ${d.need || "?"}\nInsight: ${d.insight || "?"}` : "",
  },
  {
    key: "idea",
    title: " הרעיון הנבחר",
    description: "מה אתם בונים ולמה דווקא זה",
    url: "/effort-impact",
    sourceStep: "effort_impact",
    check: (d) => (d?.ideas?.length ? "ready" : "missing"),
    extract: (d) => JSON.stringify(d?.ideas || [], null, 2),
  },
  {
    key: "prototype",
    title: "אב-טיפוס / פרומפט",
    description: "ה-PRD המוכן ל-Lovable",
    url: "/prd",
    sourceStep: "prd_generator",
    check: (d) => (d?.prdOutput?.length > 100 ? "ready" : d?.prdOutput ? "draft" : "missing"),
    extract: (d) => d?.prdOutput || "",
  },
  {
    key: "pitch",
    title: " סקריפט פיץ׳",
    description: "60 שניות שמוכרות",
    url: "/pitch",
    sourceStep: "pitch",
    check: (d) => (d?.script ? "ready" : "missing"),
    extract: (d) => d?.script || "",
  },
  {
    key: "deck",
    title: " שלד מצגת",
    description: "5 שקפים מוכנים להעתקה",
    url: "/pitch",
    sourceStep: "pitch",
    check: (d) => (d?.slides?.length >= 3 ? "ready" : "missing"),
    extract: (d) =>
      (d?.slides || [])
        .map((s: any, i: number) => `${i + 1}. ${s.title}\n${(s.bullets || []).map((b: string) => `  - ${b}`).join("\n")}`)
        .join("\n\n"),
  },
];

const StatusIcon = ({ s }: { s: "ready" | "draft" | "missing" }) => {
  if (s === "ready") return <Check className="text-emerald-500" size={20} />;
  if (s === "draft") return <AlertCircle className="text-amber-500" size={20} />;
  return <Circle className="text-muted-foreground" size={20} />;
};

const Deliverables = () => {
  const { getStepData } = useProject();
  const { toast } = useToast();

  const rows = ITEMS.map((it) => {
    const data = getStepData(it.sourceStep);
    return { ...it, status: it.check(data), content: it.extract(data) };
  });
  const readyCount = rows.filter((r) => r.status === "ready").length;

  const exportPack = () => {
    const md =
      `# Hackathon Pack\n\n_Generated ${new Date().toLocaleString("he-IL")}_\n\n` +
      rows
        .map(
          (r) =>
            `## ${r.title}\n_Status: ${r.status}_\n\n${r.content || "(missing)"}\n`
        )
        .join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hackathon-pack-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "החבילה ירדה! " });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
        <div className="text-center">
          <h1 className="font-sketch text-4xl mb-2"> מסירה</h1>
          <p className="font-hand text-xl text-muted-foreground">
            חמישה תוצרים שצריכים לצאת מהיום הזה.
          </p>
        </div>

        <div className="sketch-card p-5 flex items-center gap-4 flex-wrap">
          <div className="text-3xl font-bold">{readyCount}/{rows.length}</div>
          <div className="font-hand text-lg flex-1">תוצרים מוכנים</div>
          <Button size="lg" onClick={exportPack} disabled={readyCount === 0}>
            <Download size={16} /> ייצוא חבילת האקתון
          </Button>
        </div>

        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="sketch-card p-4 flex items-center gap-3">
              <StatusIcon s={r.status} />
              <div className="flex-1">
                <div className="font-sketch text-lg">{r.title}</div>
                <div className="font-hand text-sm text-muted-foreground">{r.description}</div>
              </div>
              <Link to={r.url}>
                <Button variant="outline" size="sm">
                  {r.status === "ready" ? "ערוך" : "פתח"}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="ghost">חזרה לבית →</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Deliverables;
