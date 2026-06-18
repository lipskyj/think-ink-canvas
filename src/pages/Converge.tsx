import { useState, useEffect } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";

interface Cluster {
  theme: string;
  notes: string;
  quadrant: string;
}

interface InsightStatement {
  despite: string;
  because: string;
  therefore: string;
}

const PROBLEM_TYPES = [
  { key: "cognitive", label: "🧠 קוגניטיבי", desc: "אי-הבנה, עומס, בלבול" },
  { key: "emotional", label: "❤️ רגשי", desc: "פחד, חרדה, אובדן שליטה" },
  { key: "behavioral", label: "🔄 התנהגותי", desc: "הרגלים, קיצורי דרך, הימנעות" },
  { key: "structural", label: "🏗️ מבני", desc: "זמן, תמריצים, כוח, מדיניות" },
];

const INTERVENTION_LEVELS = [
  { key: "tool", label: "🔧 כלי", desc: "כלי או תכונה חדשים" },
  { key: "process", label: "📋 תהליך", desc: "שינוי אופן הביצוע" },
  { key: "language", label: "💬 שפה", desc: "שינוי אופן המסגור" },
  { key: "social_norm", label: "👥 נורמה חברתית", desc: "שינוי ציפיות או תרבות" },
  { key: "support", label: "🤝 מערכת תמיכה", desc: "תמיכת עמיתים, אימון, חניכה" },
  { key: "incentives", label: "🎁 תמריצים", desc: "תגמולים, הכרה, מוטיבציה" },
];

const Converge = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const saved = getStepData("converge");

  const [clusters, setClusters] = useState<Cluster[]>(
    saved?.clusters || [{ theme: "", notes: "", quadrant: "אומר" }]
  );
  const [outliers, setOutliers] = useState(saved?.outliers || "");
  const [repeatedThemes, setRepeatedThemes] = useState(saved?.repeatedThemes || "");
  const [gaps, setGaps] = useState(saved?.gaps || "");
  const [insights, setInsights] = useState<InsightStatement[]>(
    saved?.insights || [{ despite: "", because: "", therefore: "" }]
  );
  const [problemTypes, setProblemTypes] = useState<string[]>(saved?.problemTypes || []);
  const [problemNotes, setProblemNotes] = useState(saved?.problemNotes || "");
  const [hmws, setHmws] = useState<string[]>(saved?.hmws || [""]);
  const [interventions, setInterventions] = useState<string[]>(saved?.interventions || []);
  const [interventionRationale, setInterventionRationale] = useState(saved?.interventionRationale || "");

  useEffect(() => {
    if (saved) {
      setClusters(saved.clusters || [{ theme: "", notes: "", quadrant: "אומר" }]);
      setOutliers(saved.outliers || "");
      setRepeatedThemes(saved.repeatedThemes || "");
      setGaps(saved.gaps || "");
      setInsights(saved.insights || [{ despite: "", because: "", therefore: "" }]);
      setProblemTypes(saved.problemTypes || []);
      setProblemNotes(saved.problemNotes || "");
      setHmws(saved.hmws || [""]);
      setInterventions(saved.interventions || []);
      setInterventionRationale(saved.interventionRationale || "");
    }
  }, [saved]);

  const updateCluster = (i: number, field: keyof Cluster, value: string) => {
    setClusters((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  };
  const addCluster = () => setClusters((prev) => [...prev, { theme: "", notes: "", quadrant: "אומר" }]);
  const removeCluster = (i: number) => {
    if (clusters.length <= 1) return;
    setClusters((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateInsight = (i: number, field: keyof InsightStatement, value: string) => {
    setInsights((prev) => prev.map((ins, idx) => (idx === i ? { ...ins, [field]: value } : ins)));
  };
  const addInsight = () => setInsights((prev) => [...prev, { despite: "", because: "", therefore: "" }]);
  const removeInsight = (i: number) => {
    if (insights.length <= 1) return;
    setInsights((prev) => prev.filter((_, idx) => idx !== i));
  };
  const toggleProblemType = (key: string) => {
    setProblemTypes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };
  const updateHmw = (i: number, value: string) => {
    setHmws((prev) => prev.map((h, idx) => (idx === i ? value : h)));
  };
  const addHmw = () => setHmws((prev) => [...prev, ""]);
  const removeHmw = (i: number) => {
    if (hmws.length <= 1) return;
    setHmws((prev) => prev.filter((_, idx) => idx !== i));
  };
  const toggleIntervention = (key: string) => {
    setInterventions((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const getData = () => ({
    clusters, outliers, repeatedThemes, gaps, insights, problemTypes, problemNotes, hmws, interventions, interventionRationale,
  });

  const previousData = getAllPreviousData("converge");
  const allData = getData();

  return (
    <StepPage stepKey="converge" onSave={getData}>
      {/* סעיף 1: אשכול וסינתזה */}
      <div className="mb-8">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-xl mb-1">1. אשכול וסינתזה</h2>
          <SectionHelper stepKey="converge" sectionKey="clusters" currentData={allData} previousData={previousData} onApply={(v) => updateCluster(0, "theme", v)} />
        </div>
        <p className="font-hand text-lg text-muted-foreground mb-4">
          קבצו הערות דומות לנושאים. תנו לכל אשכול שם נושא שמייצג את הקבוצה.
        </p>

        <div className="space-y-4">
          {clusters.map((cluster, i) => (
            <div key={i} className="sketch-card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-sketch text-sm">אשכול {i + 1}</span>
                {clusters.length > 1 && (
                  <button onClick={() => removeCluster(i)} className="font-hand text-muted-foreground hover:text-foreground text-lg">✕</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">🏷️ שם נושא</label>
                    <SectionHelper stepKey="converge" sectionKey="themeName" currentData={allData} previousData={previousData} onApply={(v) => updateCluster(i, "theme", v)} />
                  </div>
                  <input className="sketch-input text-sm" placeholder='לדוגמה: "אימות מאחרים"' value={cluster.theme} onChange={(e) => updateCluster(i, "theme", e.target.value)} />
                </div>
                <div>
                  <label className="font-sketch text-xs block mb-1">📌 רביע</label>
                  <select className="sketch-input text-sm" value={cluster.quadrant} onChange={(e) => updateCluster(i, "quadrant", e.target.value)}>
                    <option>אומר</option>
                    <option>חושב</option>
                    <option>עושה</option>
                    <option>מרגיש</option>
                    <option>מרובה</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">📝 הערות באשכול</label>
                    <SectionHelper stepKey="converge" sectionKey="clusterNotes" currentData={allData} previousData={previousData} onApply={(v) => updateCluster(i, "notes", v)} />
                  </div>
                  <textarea className="sketch-input min-h-[50px] text-sm" placeholder="רשמו את התצפיות המקובצות..." value={cluster.notes} onChange={(e) => updateCluster(i, "notes", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addCluster} className="sketch-btn-outline mt-3 text-sm">+ הוסף אשכול</button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="sketch-card">
            <div className="flex items-center relative">
              <label className="font-sketch text-xs block mb-1">🔴 חריגים</label>
              <SectionHelper stepKey="converge" sectionKey="outliers" currentData={allData} previousData={previousData} onApply={(v) => setOutliers(v)} />
            </div>
            <textarea className="sketch-input min-h-[60px] text-sm" placeholder="נקודות מידע שלא התאימו לאף אשכול..." value={outliers} onChange={(e) => setOutliers(e.target.value)} />
          </div>
          <div className="sketch-card">
            <div className="flex items-center relative">
              <label className="font-sketch text-xs block mb-1">🔁 נושאים חוזרים</label>
              <SectionHelper stepKey="converge" sectionKey="repeatedThemes" currentData={allData} previousData={previousData} onApply={(v) => setRepeatedThemes(v)} />
            </div>
            <textarea className="sketch-input min-h-[60px] text-sm" placeholder="נושאים שהופיעו במספר רביעים..." value={repeatedThemes} onChange={(e) => setRepeatedThemes(e.target.value)} />
          </div>
          <div className="sketch-card">
            <div className="flex items-center relative">
              <label className="font-sketch text-xs block mb-1">❓ פערים</label>
              <SectionHelper stepKey="converge" sectionKey="gaps" currentData={allData} previousData={previousData} onApply={(v) => setGaps(v)} />
            </div>
            <textarea className="sketch-input min-h-[60px] text-sm" placeholder="מה חסר בהבנה שלנו?" value={gaps} onChange={(e) => setGaps(e.target.value)} />
          </div>
        </div>
      </div>

      {/* סעיף 2: הצהרות תובנה */}
      <div className="mb-8">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-xl mb-1">2. הצהרות תובנה</h2>
          <SectionHelper stepKey="converge" sectionKey="insights" currentData={allData} previousData={previousData} onApply={(v) => updateInsight(0, "despite", v)} />
        </div>
        <p className="font-hand text-lg text-muted-foreground mb-2">
          כתבו תובנות שמסבירות <em>למה</em> ההתנהגות הגיונית — לא מה אנשים רוצים.
        </p>
        <div className="sketch-border-thin p-3 mb-4 bg-secondary/30">
          <p className="font-hand text-base text-muted-foreground">
            <strong>מבנה:</strong> למרות [גישה/יכולת] → בגלל [מתח אמיתי] → לכן [התנהגות מתקבלת]
          </p>
        </div>

        <div className="space-y-4">
          {insights.map((ins, i) => (
            <div key={i} className="sketch-card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-sketch text-sm">תובנה {i + 1}</span>
                {insights.length > 1 && (
                  <button onClick={() => removeInsight(i)} className="font-hand text-muted-foreground hover:text-foreground text-lg">✕</button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs">למרות...</label>
                    <SectionHelper stepKey="converge" sectionKey="despite" currentData={allData} previousData={previousData} onApply={(v) => updateInsight(i, "despite", v)} />
                  </div>
                  <textarea className="sketch-input min-h-[40px] text-sm" placeholder="למרות שיש גישה לכלים רבים..." value={ins.despite} onChange={(e) => updateInsight(i, "despite", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs">בגלל...</label>
                    <SectionHelper stepKey="converge" sectionKey="because" currentData={allData} previousData={previousData} onApply={(v) => updateInsight(i, "because", v)} />
                  </div>
                  <textarea className="sketch-input min-h-[40px] text-sm" placeholder="...מורים מרגישים מוצפים כי הם אחראים לבחור לבד..." value={ins.because} onChange={(e) => updateInsight(i, "because", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs">לכן...</label>
                    <SectionHelper stepKey="converge" sectionKey="therefore" currentData={allData} previousData={previousData} onApply={(v) => updateInsight(i, "therefore", v)} />
                  </div>
                  <textarea className="sketch-input min-h-[40px] text-sm" placeholder="...הם נשארים עם שיטות מוכרות גם כשיש אפשרויות טובות יותר." value={ins.therefore} onChange={(e) => updateInsight(i, "therefore", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addInsight} className="sketch-btn-outline mt-3 text-sm">+ הוסף תובנה</button>
      </div>

      {/* סעיף 3: סיווג בעיה */}
      <div className="mb-8">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-xl mb-1">3. סיווג בעיה</h2>
          <SectionHelper stepKey="converge" sectionKey="problemTypes" currentData={allData} previousData={previousData} onApply={(v) => setProblemNotes(v)} />
        </div>
        <p className="font-hand text-lg text-muted-foreground mb-4">
          עם איזה סוג בעיה אתם מתמודדים? סיווג שגוי יוביל לפתרון כושל — גם אם הוא "טוב".
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROBLEM_TYPES.map((pt) => (
            <button key={pt.key} onClick={() => toggleProblemType(pt.key)} className={`sketch-card text-right transition-all ${problemTypes.includes(pt.key) ? "ring-2 ring-foreground" : "opacity-70"}`}>
              <span className="font-sketch text-sm block">{pt.label}</span>
              <span className="font-hand text-base text-muted-foreground">{pt.desc}</span>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center relative">
            <label className="font-sketch text-xs block mb-1">📝 למה סיווג זה?</label>
            <SectionHelper stepKey="converge" sectionKey="problemNotes" currentData={allData} previousData={previousData} onApply={(v) => setProblemNotes(v)} />
          </div>
          <textarea className="sketch-input min-h-[60px] text-sm" placeholder="הסבירו למה סיווגתם את הבעיה כך..." value={problemNotes} onChange={(e) => setProblemNotes(e.target.value)} />
        </div>
      </div>

      {/* סעיף 4: איך נוכל */}
      <div className="mb-8">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-xl mb-1">4. איך נוכל?</h2>
          <SectionHelper stepKey="converge" sectionKey="hmws" currentData={allData} previousData={previousData} onApply={(v) => updateHmw(0, v)} />
        </div>
        <p className="font-hand text-lg text-muted-foreground mb-2">
          תרגמו תובנות לשאלות הזדמנות. עגנו אותן במפת האמפתיה — כוונו למתח, לא לשטח.
        </p>
        <div className="sketch-border-thin p-3 mb-4 bg-secondary/30">
          <p className="font-hand text-base text-muted-foreground">
            ✅ "איך נוכל להפחית את הסיכון הרגשי של לנסות משהו חדש מבלי להגדיל עומס עבודה?"
            <br />
            ❌ "איך נוכל לבנות כלי טוב יותר?"
          </p>
        </div>
        <div className="space-y-3">
          {hmws.map((hmw, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-sketch text-sm mt-2 shrink-0">אנ״ {i + 1}</span>
              <textarea className="sketch-input min-h-[40px] text-sm flex-1" placeholder="איך נוכל..." value={hmw} onChange={(e) => updateHmw(i, e.target.value)} />
              {hmws.length > 1 && (
                <button onClick={() => removeHmw(i)} className="font-hand text-muted-foreground hover:text-foreground text-lg mt-1">✕</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addHmw} className="sketch-btn-outline mt-3 text-sm">+ הוסף אנ״</button>
      </div>

      {/* סעיף 5: רמת התערבות */}
      <div className="mb-4">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-xl mb-1">5. רמת התערבות</h2>
          <SectionHelper stepKey="converge" sectionKey="interventions" currentData={allData} previousData={previousData} onApply={(v) => setInterventionRationale(v)} />
        </div>
        <p className="font-hand text-lg text-muted-foreground mb-4">
          היכן כדאי להתערב? תובנות מפת האמפתיה אמורות להנחות את הבחירה.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INTERVENTION_LEVELS.map((il) => (
            <button key={il.key} onClick={() => toggleIntervention(il.key)} className={`sketch-card text-right transition-all ${interventions.includes(il.key) ? "ring-2 ring-foreground" : "opacity-70"}`}>
              <span className="font-sketch text-sm block">{il.label}</span>
              <span className="font-hand text-base text-muted-foreground">{il.desc}</span>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center relative">
            <label className="font-sketch text-xs block mb-1">💡 נימוק</label>
            <SectionHelper stepKey="converge" sectionKey="interventionRationale" currentData={allData} previousData={previousData} onApply={(v) => setInterventionRationale(v)} />
          </div>
          <textarea className="sketch-input min-h-[60px] text-sm" placeholder="למה התערבות זו? לדוגמה: 'אם האמפתיה מראה פחד משיפוט, שיתוף עמיתים עדיף על תכונה חדשה.'" value={interventionRationale} onChange={(e) => setInterventionRationale(e.target.value)} />
        </div>
      </div>
    </StepPage>
  );
};

export default Converge;
