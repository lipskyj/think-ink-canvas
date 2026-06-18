import { useState, useEffect, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";
import CoherenceTracker from "@/components/CoherenceTracker";
import { useAutoFill } from "@/hooks/useAutoFill";

interface TestSession {
  participant: string;
  task: string;
  observations: string;
  quotes: string;
  rating: string;
}

interface Iteration {
  round: number;
  whatChanged: string;
  whatLearned: string;
  nextAction: string;
}

const UserTesting = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const saved = getStepData("user_testing");

  const [testGoal, setTestGoal] = useState(saved?.testGoal || "");
  const [hypothesis, setHypothesis] = useState(saved?.hypothesis || "");
  const [sessions, setSessions] = useState<TestSession[]>(
    saved?.sessions || [{ participant: "", task: "", observations: "", quotes: "", rating: "" }]
  );
  const [iterations, setIterations] = useState<Iteration[]>(
    saved?.iterations || [{ round: 1, whatChanged: "", whatLearned: "", nextAction: "" }]
  );
  const [keyFindings, setKeyFindings] = useState(saved?.keyFindings || "");

  useEffect(() => {
    if (saved) {
      setTestGoal(saved.testGoal || "");
      setHypothesis(saved.hypothesis || "");
      setSessions(saved.sessions || [{ participant: "", task: "", observations: "", quotes: "", rating: "" }]);
      setIterations(saved.iterations || [{ round: 1, whatChanged: "", whatLearned: "", nextAction: "" }]);
      setKeyFindings(saved.keyFindings || "");
    }
  }, [saved]);

  // Auto-fill from PrototypeBrief and AssumptionSelection
  const autoFillFields = useMemo(() => ({
    testGoal: { value: testGoal, set: setTestGoal },
    hypothesis: { value: hypothesis, set: setHypothesis },
  }), [testGoal, hypothesis]);
  useAutoFill("user_testing", autoFillFields);

  const updateSession = (index: number, field: keyof TestSession, value: string) => {
    setSessions((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };
  const addSession = () => {
    setSessions((prev) => [...prev, { participant: "", task: "", observations: "", quotes: "", rating: "" }]);
  };
  const removeSession = (index: number) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((_, i) => i !== index));
  };
  const updateIteration = (index: number, field: keyof Iteration, value: string) => {
    setIterations((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };
  const addIteration = () => {
    setIterations((prev) => [...prev, { round: prev.length + 1, whatChanged: "", whatLearned: "", nextAction: "" }]);
  };

  const getData = () => ({ testGoal, hypothesis, sessions, iterations, keyFindings });
  const previousData = getAllPreviousData("user_testing");

  return (
    <StepPage stepKey="user_testing" onSave={getData}>
      <CoherenceTracker stepKey="user_testing" currentData={getData()} />

      {/* הגדרת מבחן */}
      <div className="sketch-card mb-6">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-lg mb-3"> הגדרת מבחן</h2>
          <SectionHelper stepKey="user_testing" sectionKey="testSetup" currentData={getData()} previousData={previousData} onApply={(v) => setTestGoal(v)} />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center relative">
              <label className="font-sketch text-xs block mb-1">מטרה</label>
              <SectionHelper stepKey="user_testing" sectionKey="testGoal" currentData={getData()} previousData={previousData} onApply={(v) => setTestGoal(v)} />
            </div>
            <textarea className="sketch-input min-h-[50px]" placeholder="מה אתם מנסים ללמוד?" value={testGoal} onChange={(e) => setTestGoal(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center relative">
              <label className="font-sketch text-xs block mb-1">השערה</label>
              <SectionHelper stepKey="user_testing" sectionKey="hypothesis" currentData={getData()} previousData={previousData} onApply={(v) => setHypothesis(v)} />
            </div>
            <textarea className="sketch-input min-h-[50px]" placeholder="אנו מאמינים ש... יגרום ל... כי..." value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
          </div>
        </div>
      </div>

      {/* סשנים */}
      <div className="mb-6">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-lg mb-3">👥 סשני בדיקה</h2>
          <SectionHelper stepKey="user_testing" sectionKey="session" currentData={getData()} previousData={previousData} onApply={(v) => updateSession(0, "observations", v)} />
        </div>
        <div className="space-y-4">
          {sessions.map((session, i) => (
            <div key={i} className="sketch-card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-sketch text-sm">משתתף {i + 1}</span>
                {sessions.length > 1 && (
                  <button onClick={() => removeSession(i)} className="font-hand text-muted-foreground hover:text-foreground text-lg">✕</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">משתתף</label>
                    <SectionHelper stepKey="user_testing" sectionKey="participant" currentData={getData()} previousData={previousData} />
                  </div>
                  <input className="sketch-input text-sm" placeholder="שם / סוג" value={session.participant} onChange={(e) => updateSession(i, "participant", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">משימה שניתנה</label>
                    <SectionHelper stepKey="user_testing" sectionKey="task" currentData={getData()} previousData={previousData} />
                  </div>
                  <input className="sketch-input text-sm" placeholder="מה הם התבקשו לעשות?" value={session.task} onChange={(e) => updateSession(i, "task", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">📝 תצפיות</label>
                    <SectionHelper stepKey="user_testing" sectionKey="observations" currentData={getData()} previousData={previousData} />
                  </div>
                  <textarea className="sketch-input min-h-[60px] text-sm" placeholder="מה קרה?" value={session.observations} onChange={(e) => updateSession(i, "observations", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">💬 ציטוטים</label>
                    <SectionHelper stepKey="user_testing" sectionKey="quotes" currentData={getData()} previousData={previousData} />
                  </div>
                  <textarea className="sketch-input min-h-[60px] text-sm" placeholder="דברים בולטים שאמרו" value={session.quotes} onChange={(e) => updateSession(i, "quotes", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="font-sketch text-xs block mb-1"> דירוג / תוצאה</label>
                  <input className="sketch-input text-sm" placeholder="הצלחה / חלקית / נכשל" value={session.rating} onChange={(e) => updateSession(i, "rating", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addSession} className="sketch-btn-outline mt-3 text-sm">+ הוסף סשן</button>
      </div>

      {/* סבבי איטרציה */}
      <div className="mb-6">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-lg mb-3"> סבבי איטרציה</h2>
          <SectionHelper stepKey="user_testing" sectionKey="iteration" currentData={getData()} previousData={previousData} />
        </div>
        <div className="space-y-4">
          {iterations.map((it, i) => (
            <div key={i} className="sketch-card">
              <span className="font-sketch text-sm mb-2 block">סבב {it.round}</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">🔧 מה השתנה</label>
                    <SectionHelper stepKey="user_testing" sectionKey="whatChanged" currentData={getData()} previousData={previousData} />
                  </div>
                  <textarea className="sketch-input min-h-[50px] text-sm" placeholder="מה שיניתם?" value={it.whatChanged} onChange={(e) => updateIteration(i, "whatChanged", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">מה למדנו</label>
                    <SectionHelper stepKey="user_testing" sectionKey="whatLearned" currentData={getData()} previousData={previousData} />
                  </div>
                  <textarea className="sketch-input min-h-[50px] text-sm" placeholder="מה למדתם?" value={it.whatLearned} onChange={(e) => updateIteration(i, "whatLearned", e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center relative">
                    <label className="font-sketch text-xs block mb-1">➡️ פעולה הבאה</label>
                    <SectionHelper stepKey="user_testing" sectionKey="nextAction" currentData={getData()} previousData={previousData} />
                  </div>
                  <textarea className="sketch-input min-h-[50px] text-sm" placeholder="מה תעשו הלאה?" value={it.nextAction} onChange={(e) => updateIteration(i, "nextAction", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addIteration} className="sketch-btn-outline mt-3 text-sm">+ הוסף סבב איטרציה</button>
      </div>

      {/* ממצאים מרכזיים */}
      <div className="sketch-card">
        <div className="flex items-center relative">
          <h2 className="font-sketch text-lg mb-3">🔑 ממצאים מרכזיים</h2>
          <SectionHelper stepKey="user_testing" sectionKey="keyFindings" currentData={getData()} previousData={previousData} />
        </div>
        <textarea className="sketch-input min-h-[80px]" placeholder="סכמו את התובנות החשובות ביותר..." value={keyFindings} onChange={(e) => setKeyFindings(e.target.value)} />
      </div>
    </StepPage>
  );
};

export default UserTesting;
