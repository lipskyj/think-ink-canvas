import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useClass } from "@/contexts/ClassContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Presentation, Code2, Save, ArrowLeft } from "lucide-react";

interface ClassRow {
  id: string;
  name: string;
  join_code: string | null;
  team_avatar_url: string | null;
  slides_url: string | null;
  prototype_url: string | null;
  submission_notes: string | null;
  submitted_at: string | null;
}

const Submissions = () => {
  const { session, isClassMode } = useClass();
  const { toast } = useToast();
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slides, setSlides] = useState("");
  const [proto, setProto] = useState("");
  const [notes, setNotes] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("classes")
      .select("id, name, join_code, team_avatar_url, slides_url, prototype_url, submission_notes, submitted_at")
      .order("submitted_at", { ascending: false, nullsFirst: false });
    const list = (data as ClassRow[]) || [];
    setRows(list);
    if (session) {
      const mine = list.find((r) => r.id === session.classId);
      if (mine) {
        setSlides(mine.slides_url || "");
        setProto(mine.prototype_url || "");
        setNotes(mine.submission_notes || "");
      }
    }
    setLoading(false);
  }, [session]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const submit = async () => {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from("classes")
      .update({
        slides_url: slides.trim() || null,
        prototype_url: proto.trim() || null,
        submission_notes: notes.trim() || null,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", session.classId);
    setSaving(false);
    if (error) {
      toast({ title: "שגיאה בשמירה", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "הוגש בהצלחה!" });
    fetchAll();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-16" dir="rtl">
        <div className="mb-6">
          <Link to="/" className="sketch-btn-outline text-sm inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> חזרה
          </Link>
        </div>

        <header className="text-center mb-10">
          <span className="pill-chip pill-chip-coral mb-4 inline-block">הגשת תוצרים</span>
          <h1 className="display-mega leading-[0.9] mb-3">תוצרי הקבוצות</h1>
          <p className="font-hand text-xl text-muted-foreground">
            כל קבוצה מגישה מצגת + קישור לפיתוח. כולם רואים את כולם.
          </p>
        </header>

        {isClassMode && session ? (
          <section className="sketch-card mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Save className="h-5 w-5" />
              <h2 className="font-sketch text-xl">ההגשה שלכם — {session.className}</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-sketch text-sm mb-1 flex items-center gap-1">
                  <Presentation className="h-4 w-4" /> קישור למצגת
                </label>
                <input
                  className="sketch-input"
                  placeholder="https://docs.google.com/presentation/..."
                  value={slides}
                  onChange={(e) => setSlides(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="font-sketch text-sm mb-1 flex items-center gap-1">
                  <Code2 className="h-4 w-4" /> קישור לפיתוח / אב-טיפוס
                </label>
                <input
                  className="sketch-input"
                  placeholder="https://lovable.app/projects/..."
                  value={proto}
                  onChange={(e) => setProto(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="font-sketch text-sm block mb-1">הערות (אופציונלי)</label>
                <textarea
                  className="sketch-input min-h-[80px] resize-none notebook-lines"
                  placeholder="משהו שתרצו שאחרים ידעו על התוצר שלכם..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={submit}
                  disabled={saving || (!slides.trim() && !proto.trim())}
                  className="sketch-btn flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "שומר..." : "הגש"}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <CodeSubmit rows={rows} onSubmitted={fetchAll} />
        )}

        <section>
          <h2 className="font-sketch text-2xl mb-4">כל ההגשות</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rows.map((r) => {
                const submitted = !!(r.slides_url || r.prototype_url);
                return (
                  <div key={r.id} className={`sketch-card flex flex-col ${!submitted ? "opacity-60" : ""}`}>
                    {r.team_avatar_url ? (
                      <img src={r.team_avatar_url} alt={r.name} className="w-full aspect-square object-cover rounded-md mb-3 border-2 border-foreground" />
                    ) : (
                      <div className="w-full aspect-square bg-secondary/40 border-2 border-dashed border-foreground/30 rounded-md mb-3 flex items-center justify-center font-sketch text-4xl text-muted-foreground">
                        {r.join_code || "?"}
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-sketch text-lg truncate flex-1">{r.name}</h3>
                      {r.join_code && (
                        <span className="pill-chip pill-chip-outline text-[10px]">{r.join_code}</span>
                      )}
                    </div>
                    {r.submission_notes && (
                      <p className="font-hand text-sm text-muted-foreground mb-3 line-clamp-3">{r.submission_notes}</p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-2">
                      {r.slides_url && (
                        <a href={r.slides_url} target="_blank" rel="noreferrer" className="sketch-btn-outline text-xs flex items-center gap-1">
                          <Presentation className="h-3 w-3" /> מצגת <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {r.prototype_url && (
                        <a href={r.prototype_url} target="_blank" rel="noreferrer" className="sketch-btn-outline text-xs flex items-center gap-1">
                          <Code2 className="h-3 w-3" /> פיתוח <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {!submitted && (
                        <span className="text-xs text-muted-foreground font-hand">טרם הוגש</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

function CodeSubmit({ rows, onSubmitted }: { rows: ClassRow[]; onSubmitted: () => void }) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [target, setTarget] = useState<ClassRow | null>(null);
  const [slides, setSlides] = useState("");
  const [proto, setProto] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const lookup = () => {
    const c = code.trim().toUpperCase();
    const found = rows.find((r) => (r.join_code || "").toUpperCase() === c);
    if (!found) {
      toast({ title: "קוד לא נמצא", variant: "destructive" });
      return;
    }
    setTarget(found);
    setSlides(found.slides_url || "");
    setProto(found.prototype_url || "");
    setNotes(found.submission_notes || "");
  };

  const submit = async () => {
    if (!target) return;
    setSaving(true);
    const { error } = await supabase
      .from("classes")
      .update({
        slides_url: slides.trim() || null,
        prototype_url: proto.trim() || null,
        submission_notes: notes.trim() || null,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", target.id);
    setSaving(false);
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "הוגש בהצלחה!" });
    onSubmitted();
  };

  return (
    <section className="sketch-card mb-10">
      <div className="flex items-center gap-2 mb-3">
        <Save className="h-5 w-5" />
        <h2 className="font-sketch text-xl">הגשה עם קוד הקבוצה</h2>
      </div>
      <p className="font-hand text-sm text-muted-foreground mb-3">
        הזינו את הקוד שקיבלתם מהמארגן (למשל A6) כדי להעלות את התוצרים שלכם.
      </p>
      {!target ? (
        <div className="flex gap-2 max-w-sm">
          <input
            className="sketch-input text-center font-sketch text-2xl tracking-widest uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="A6"
            maxLength={4}
            dir="ltr"
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button onClick={lookup} disabled={!code.trim()} className="sketch-btn disabled:opacity-50">
            המשך
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="font-sketch text-lg flex items-center gap-2">
            הקבוצה: {target.name}
            <span className="pill-chip pill-chip-outline text-[10px]">{target.join_code}</span>
            <button onClick={() => setTarget(null)} className="text-xs underline text-muted-foreground">החלף קוד</button>
          </div>
          <div>
            <label className="font-sketch text-sm mb-1 flex items-center gap-1">
              <Presentation className="h-4 w-4" /> קישור למצגת
            </label>
            <input className="sketch-input" value={slides} onChange={(e) => setSlides(e.target.value)} dir="ltr" placeholder="https://..." />
          </div>
          <div>
            <label className="font-sketch text-sm mb-1 flex items-center gap-1">
              <Code2 className="h-4 w-4" /> קישור לפיתוח / אב-טיפוס
            </label>
            <input className="sketch-input" value={proto} onChange={(e) => setProto(e.target.value)} dir="ltr" placeholder="https://..." />
          </div>
          <div>
            <label className="font-sketch text-sm block mb-1">הערות (אופציונלי)</label>
            <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <button onClick={submit} disabled={saving || (!slides.trim() && !proto.trim())} className="sketch-btn flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "שומר..." : "הגש"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Submissions;
