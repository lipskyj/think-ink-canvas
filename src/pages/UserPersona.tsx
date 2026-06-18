import { useState, useEffect, useCallback, useMemo } from "react";
import StepPage from "@/components/StepPage";
import { useProject } from "@/contexts/ProjectContext";
import LinkedDataBanner from "@/components/LinkedDataBanner";
import SectionHelper from "@/components/SectionHelper";
import { useAutoFill } from "@/hooks/useAutoFill";

const UserPersona = () => {
  const { getStepData, getAllPreviousData } = useProject();
  const [persona, setPersona] = useState({
    name: "", age: "", occupation: "", bio: "", goals: "", frustrations: "", motivations: "", quote: "",
  });

  useEffect(() => {
    const saved = getStepData("user_persona");
    if (saved) setPersona((prev) => ({ ...prev, ...saved }));
  }, [getStepData]);

  const update = (field: string, value: string) => {
    setPersona((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-fill from empathy map
  const autoFillFields = useMemo(() => ({
    name: { value: persona.name, set: (v: string) => update("name", v) },
    bio: { value: persona.bio, set: (v: string) => update("bio", v) },
    frustrations: { value: persona.frustrations, set: (v: string) => update("frustrations", v) },
    goals: { value: persona.goals, set: (v: string) => update("goals", v) },
    motivations: { value: persona.motivations, set: (v: string) => update("motivations", v) },
    quote: { value: persona.quote, set: (v: string) => update("quote", v) },
  }), [persona.name, persona.bio, persona.frustrations, persona.goals, persona.motivations, persona.quote]);
  useAutoFill("user_persona", autoFillFields);

  const handleApplyLinked = (field: string, value: string) => {
    if (field in persona && !persona[field as keyof typeof persona]?.trim()) {
      update(field, value);
    }
  };

  const getData = useCallback(() => persona, [persona]);
  const hasContent = Object.values(persona).some((v) => v.trim());
  const previousData = getAllPreviousData("user_persona");

  return (
    <StepPage stepKey="user_persona" onSave={getData} canComplete={hasContent}>
      <LinkedDataBanner stepKey="user_persona" onApplyField={handleApplyLinked} />

      <div className="sketch-border p-5 mb-6 bg-secondary/20">
        <p className="text-base text-muted-foreground">
          👤 צרו פרופיל בדיוני אך מציאותי של משתמש היעד שלכם בהתבסס על המחקר.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">📛 שם</label>
            <SectionHelper stepKey="user_persona" sectionKey="name" currentData={persona} previousData={previousData} onApply={(v) => update("name", v)} />
          </div>
          <input className="sketch-input" placeholder="לדוגמה: שרה כהן" value={persona.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">🎂 גיל</label>
            <SectionHelper stepKey="user_persona" sectionKey="age" currentData={persona} previousData={previousData} onApply={(v) => update("age", v)} />
          </div>
          <input className="sketch-input" placeholder="לדוגמה: 28" value={persona.age} onChange={(e) => update("age", e.target.value)} />
        </div>
        <div className="sketch-card md:col-span-2">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">💼 תפקיד</label>
            <SectionHelper stepKey="user_persona" sectionKey="occupation" currentData={persona} previousData={previousData} onApply={(v) => update("occupation", v)} />
          </div>
          <input className="sketch-input" placeholder="לדוגמה: מעצבת UX זוטרה בסטארטאפ" value={persona.occupation} onChange={(e) => update("occupation", e.target.value)} />
        </div>
        <div className="sketch-card md:col-span-2">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">💬 ציטוט</label>
            <SectionHelper stepKey="user_persona" sectionKey="quote" currentData={persona} previousData={previousData} onApply={(v) => update("quote", v)} />
          </div>
          <input className="sketch-input italic" placeholder='"אני רק רוצה משהו שבאמת עובד..."' value={persona.quote} onChange={(e) => update("quote", e.target.value)} />
        </div>
        <div className="sketch-card md:col-span-2">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">📝 ביוגרפיה</label>
            <SectionHelper stepKey="user_persona" sectionKey="bio" currentData={persona} previousData={previousData} onApply={(v) => update("bio", v)} />
          </div>
          <textarea className="sketch-input min-h-[100px] resize-none notebook-lines" placeholder="סיפור קצר על מי האדם הזה..." value={persona.bio} onChange={(e) => update("bio", e.target.value)} />
        </div>
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">🎯 מטרות</label>
            <SectionHelper stepKey="user_persona" sectionKey="goals" currentData={persona} previousData={previousData} onApply={(v) => update("goals", v)} />
          </div>
          <textarea className="sketch-input min-h-[100px] resize-none notebook-lines" placeholder="מה הם רוצים להשיג?" value={persona.goals} onChange={(e) => update("goals", e.target.value)} />
        </div>
        <div className="sketch-card">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">😤 תסכולים</label>
            <SectionHelper stepKey="user_persona" sectionKey="frustrations" currentData={persona} previousData={previousData} onApply={(v) => update("frustrations", v)} />
          </div>
          <textarea className="sketch-input min-h-[100px] resize-none notebook-lines" placeholder="מה מעצבן או חוסם אותם?" value={persona.frustrations} onChange={(e) => update("frustrations", e.target.value)} />
        </div>
        <div className="sketch-card md:col-span-2">
          <div className="flex items-center relative">
            <label className="font-semibold text-sm block mb-2">💪 מוטיבציות</label>
            <SectionHelper stepKey="user_persona" sectionKey="motivations" currentData={persona} previousData={previousData} onApply={(v) => update("motivations", v)} />
          </div>
          <textarea className="sketch-input min-h-[80px] resize-none notebook-lines" placeholder="מה מניע אותם קדימה?" value={persona.motivations} onChange={(e) => update("motivations", e.target.value)} />
        </div>
      </div>
    </StepPage>
  );
};

export default UserPersona;
