import { useState, useEffect, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import { Plus, Trash2 } from "lucide-react";
import SectionHelper from "@/components/SectionHelper";
import { useAutoFill } from "@/hooks/useAutoFill";

interface Job {
  id: string;
  situation: string;
  motivation: string;
  outcome: string;
  functional: string;
  emotional: string;
  social: string;
}

const emptyJob = (): Job => ({
  id: crypto.randomUUID(),
  situation: "", motivation: "", outcome: "", functional: "", emotional: "", social: "",
});

const JTBD = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const existing = getStepData("jtbd");

  const [jobs, setJobs] = useState<Job[]>(existing?.jobs?.length ? existing.jobs : [emptyJob()]);
  const [mainJob, setMainJob] = useState(existing?.mainJob ?? "");
  const [constraints, setConstraints] = useState(existing?.constraints ?? "");

  useEffect(() => {
    if (existing) {
      if (existing.jobs?.length) setJobs(existing.jobs);
      if (existing.mainJob) setMainJob(existing.mainJob);
      if (existing.constraints) setConstraints(existing.constraints);
    }
  }, []);

  // Auto-fill from Persona
  const autoFillFields = useMemo(() => ({
    mainJob: { value: mainJob, set: setMainJob },
    constraints: { value: constraints, set: setConstraints },
  }), [mainJob, constraints]);
  useAutoFill("jtbd", autoFillFields);

  const updateJob = (id: string, field: keyof Job, value: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
  };
  const addJob = () => setJobs((prev) => [...prev, emptyJob()]);
  const removeJob = (id: string) => {
    if (jobs.length <= 1) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleSave = () => ({ jobs, mainJob, constraints });
  const previousData = getAllPreviousData("jtbd");
  const allData = handleSave();

  return (
    <StepPage stepKey="jtbd" onSave={handleSave}>
      <div className="space-y-8">
        <div className="sketch-border-thin p-4 bg-secondary/30">
          <p className="font-hand text-lg text-muted-foreground">
             אנשים לא קונים מוצרים — הם שוכרים אותם כדי לבצע משימה. הגדירו את המשימות שהמשתמש מנסה
            להשיג לפי הנוסחה: <strong>כאשר [מצב], אני רוצה [מוטיבציה],
            כדי ש [תוצאה]</strong>.
          </p>
        </div>

        <div>
          <div className="flex items-center relative">
            <h2 className="font-sketch text-2xl mb-4">הצהרות משימה</h2>
            <SectionHelper stepKey="jtbd" sectionKey="jobStatement" currentData={allData} previousData={previousData} onApply={(v) => updateJob(jobs[0].id, "situation", v)} />
          </div>
          <div className="space-y-6">
            {jobs.map((job, i) => (
              <div key={job.id} className="sketch-border p-5 bg-background relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sketch text-lg">משימה #{i + 1}</span>
                  {jobs.length > 1 && (
                    <button onClick={() => removeJob(job.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-3 mb-5">
                  <div>
                    <div className="flex items-center relative">
                      <label className="font-sketch text-sm text-muted-foreground block mb-1">כאשר... (מצב / טריגר)</label>
                      <SectionHelper stepKey="jtbd" sectionKey="situation" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "situation", v)} />
                    </div>
                    <textarea className="sketch-input w-full font-hand text-lg min-h-[60px]" placeholder="לדוגמה: אני מכין שיעור בלילה לפני הכיתה..." value={job.situation} onChange={(e) => updateJob(job.id, "situation", e.target.value)} />
                  </div>
                  <div>
                    <div className="flex items-center relative">
                      <label className="font-sketch text-sm text-muted-foreground block mb-1">אני רוצה... (מוטיבציה)</label>
                      <SectionHelper stepKey="jtbd" sectionKey="motivation" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "motivation", v)} />
                    </div>
                    <textarea className="sketch-input w-full font-hand text-lg min-h-[60px]" placeholder="לדוגמה: למצוא במהירות פעילות אמינה שמתאימה לתכנית הלימודים..." value={job.motivation} onChange={(e) => updateJob(job.id, "motivation", e.target.value)} />
                  </div>
                  <div>
                    <div className="flex items-center relative">
                      <label className="font-sketch text-sm text-muted-foreground block mb-1">כדי ש... (תוצאה רצויה)</label>
                      <SectionHelper stepKey="jtbd" sectionKey="outcome" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "outcome", v)} />
                    </div>
                    <textarea className="sketch-input w-full font-hand text-lg min-h-[60px]" placeholder="לדוגמה: אני ירגיש בטוח שהתלמידים שלי יהיו מעורבים מחר." value={job.outcome} onChange={(e) => updateJob(job.id, "outcome", e.target.value)} />
                  </div>
                </div>
                <div className="sketch-border-thin p-4 bg-secondary/20">
                  <div className="flex items-center relative">
                    <span className="font-sketch text-sm text-muted-foreground block mb-3">ממדי המשימה</span>
                    <SectionHelper stepKey="jtbd" sectionKey="dimensions" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "functional", v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center relative">
                        <label className="font-sketch text-xs text-muted-foreground block mb-1"> פונקציונלי</label>
                        <SectionHelper stepKey="jtbd" sectionKey="functional" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "functional", v)} />
                      </div>
                      <textarea className="sketch-input w-full font-hand text-base min-h-[50px]" placeholder="איזו משימה הם משלימים?" value={job.functional} onChange={(e) => updateJob(job.id, "functional", e.target.value)} />
                    </div>
                    <div>
                      <div className="flex items-center relative">
                        <label className="font-sketch text-xs text-muted-foreground block mb-1">💛 רגשי</label>
                        <SectionHelper stepKey="jtbd" sectionKey="emotional" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "emotional", v)} />
                      </div>
                      <textarea className="sketch-input w-full font-hand text-base min-h-[50px]" placeholder="איך הם רוצים להרגיש?" value={job.emotional} onChange={(e) => updateJob(job.id, "emotional", e.target.value)} />
                    </div>
                    <div>
                      <div className="flex items-center relative">
                        <label className="font-sketch text-xs text-muted-foreground block mb-1">👥 חברתי</label>
                        <SectionHelper stepKey="jtbd" sectionKey="social" currentData={allData} previousData={previousData} onApply={(v) => updateJob(job.id, "social", v)} />
                      </div>
                      <textarea className="sketch-input w-full font-hand text-base min-h-[50px]" placeholder="איך הם רוצים שייתפסו?" value={job.social} onChange={(e) => updateJob(job.id, "social", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addJob} className="mt-4 flex items-center gap-2 font-sketch text-sm hover:bg-secondary/50 px-4 py-2 sketch-border-thin transition-colors">
            <Plus size={16} /> הוסף משימה נוספת
          </button>
        </div>

        <div>
          <div className="flex items-center relative">
            <h2 className="font-sketch text-2xl mb-3">המשימה העיקרית</h2>
            <SectionHelper stepKey="jtbd" sectionKey="primaryJob" currentData={allData} previousData={previousData} onApply={(v) => setMainJob(v)} />
          </div>
          <p className="font-hand text-lg text-muted-foreground mb-2">איזו משימה הכי חשובה לאתגר העיצוב שלך?</p>
          <textarea className="sketch-input w-full font-hand text-lg min-h-[80px]" placeholder="כתבו את המשימה הקריטית ביותר שהמשתמש צריך לבצע..." value={mainJob} onChange={(e) => setMainJob(e.target.value)} />
        </div>

        <div>
          <div className="flex items-center relative">
            <h2 className="font-sketch text-2xl mb-3">אילוצים וקריטריוני שכירה</h2>
            <SectionHelper stepKey="jtbd" sectionKey="constraints" currentData={allData} previousData={previousData} onApply={(v) => setConstraints(v)} />
          </div>
          <p className="font-hand text-lg text-muted-foreground mb-2">מה יגרום למשתמש "לפטר" את הפתרון הנוכחי ו"לשכור" את שלכם?</p>
          <textarea className="sketch-input w-full font-hand text-lg min-h-[100px]" placeholder="לדוגמה: חייב לקחת פחות מ-5 דקות, לא דורש אישור מנהל, צריך לעבוד אופליין..." value={constraints} onChange={(e) => setConstraints(e.target.value)} />
        </div>
      </div>
    </StepPage>
  );
};

export default JTBD;
