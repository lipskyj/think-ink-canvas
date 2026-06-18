import { useState, useEffect, useCallback } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import SectionHelper from "@/components/SectionHelper";

interface Quadrant {
  key: string;
  label: string;
  emoji: string;
  placeholder: string;
  sectionKey: string;
}

const quadrants: Quadrant[] = [
  { key: "says", label: "אומר", emoji: "💬", placeholder: "״אני תמיד מחפש דרך יותר קלה לעשות את זה...״", sectionKey: "says" },
  { key: "thinks", label: "חושב", emoji: "🧠", placeholder: "״למה זה כל כך מסובך? בטח יש דרך טובה יותר...״", sectionKey: "thinks" },
  { key: "does", label: "עושה", emoji: "🖐️", placeholder: "משווה בין אפשרויות, שואל חברים, מנסה ומוותר...", sectionKey: "does" },
  { key: "feels", label: "מרגיש", emoji: "❤️", placeholder: "מתוסכל מהמורכבות, חושש לטעות, רוצה ביטחון...", sectionKey: "feels" },
];

const EmpathyMap = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [userDesc, setUserDesc] = useState("");
  const [data, setData] = useState<Record<string, string>>({
    says: "", thinks: "", does: "", feels: "",
  });

  useEffect(() => {
    const saved = getStepData("empathy_map");
    if (saved) {
      if (saved.userDesc) setUserDesc(saved.userDesc);
      if (saved.quadrants) setData(saved.quadrants);
    }
  }, [getStepData]);

  const getData = useCallback(() => ({ userDesc, quadrants: data }), [userDesc, data]);
  const hasContent = !!(userDesc.trim() || Object.values(data).some(v => v.trim()));
  const previousData = getAllPreviousData("empathy_map");

  return (
    <StepPage stepKey="empathy_map" onSave={getData} canComplete={hasContent}>
      <div className="sketch-border p-4 mb-6">
        <div className="flex items-center relative">
          <label className="font-sketch text-sm block mb-2">מיהו המשתמש שלך?</label>
          <SectionHelper stepKey="empathy_map" sectionKey="userDesc" currentData={{ userDesc, quadrants: data }} previousData={previousData} onApply={(v) => setUserDesc(v)} />
        </div>
        <input
          className="sketch-input"
          placeholder="הורה עסוק שמנסה לארגן ארוחות בריאות למשפחה..."
          value={userDesc}
          onChange={(e) => setUserDesc(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <div key={q.key} className="sketch-card">
            <div className="flex items-center relative">
              <h3 className="font-sketch text-lg mb-3 flex items-center gap-2">
                <span className="text-xl">{q.emoji}</span> {q.label}
              </h3>
              <SectionHelper stepKey="empathy_map" sectionKey={q.sectionKey} currentData={{ userDesc, quadrants: data }} previousData={previousData} onApply={(v) => setData((prev) => ({ ...prev, [q.key]: prev[q.key] ? prev[q.key] + "\n" + v : v }))} />
            </div>
            <textarea
              className="sketch-input min-h-[120px] resize-none notebook-lines"
              placeholder={q.placeholder}
              value={data[q.key]}
              onChange={(e) => setData({ ...data, [q.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </StepPage>
  );
};

export default EmpathyMap;