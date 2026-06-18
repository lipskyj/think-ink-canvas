import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClass } from "@/contexts/ClassContext";
import { Users, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function JoinClass() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { setSession } = useClass();
  const { toast } = useToast();
  const [className, setClassName] = useState("");
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customName, setCustomName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!classId) return;
    // Fetch class info AND any student names that exist in step data but not in the class list
    Promise.all([
      supabase.from("classes").select("name, student_names").eq("id", classId).single(),
      supabase.from("class_step_data").select("student_name").eq("class_id", classId),
    ]).then(async ([classRes, stepRes]) => {
      if (classRes.error || !classRes.data) {
        setError("הכיתה לא נמצאה");
        setLoading(false);
        return;
      }
      const registeredNames: string[] = classRes.data.student_names || [];
      const activeNames = new Set(
        (stepRes.data || []).map((r) => r.student_name)
      );
      // Find names that have data but aren't in the registered list
      const missingNames = [...activeNames].filter((n) => !registeredNames.includes(n));
      if (missingNames.length > 0) {
        const merged = [...registeredNames, ...missingNames];
        // Auto-sync missing names back to the class record
        await supabase.from("classes").update({ student_names: merged }).eq("id", classId);
        setStudentNames(merged);
      } else {
        setStudentNames(registeredNames);
      }
      setClassName(classRes.data.name);
      setLoading(false);
    });
  }, [classId]);

  const handleSelectStudent = (name: string) => {
    if (!classId) return;
    setSession({ classId, className, studentName: name });
    navigate("/");
  };

  const handleAddCustomName = async () => {
    const name = customName.trim();
    if (!name || !classId) return;
    if (studentNames.includes(name)) {
      handleSelectStudent(name);
      return;
    }
    setAdding(true);
    const updatedNames = [...studentNames, name];
    const { error: err } = await supabase
      .from("classes")
      .update({ student_names: updatedNames })
      .eq("id", classId);
    if (err) {
      toast({ title: "שגיאה", description: err.message, variant: "destructive" });
      setAdding(false);
      return;
    }
    setStudentNames(updatedNames);
    setAdding(false);
    handleSelectStudent(name);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-hand text-lg text-muted-foreground">טוען...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="sketch-card text-center p-8">
          <p className="font-sketch text-xl text-destructive">{error}</p>
          <p className="font-hand text-muted-foreground mt-2">בדקו שהקישור תקין</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Users className="h-12 w-12 mx-auto mb-3 text-foreground" />
          <h1 className="font-sketch text-3xl mb-1">{className}</h1>
          <p className="font-hand text-lg text-muted-foreground">בחרו את השם שלכם כדי להתחיל</p>
        </div>

        <div className="space-y-2">
          {studentNames.map((name) => (
            <button
              key={name}
              onClick={() => handleSelectStudent(name)}
              className="w-full sketch-card flex items-center justify-between py-4 px-5 hover:bg-secondary/50 transition-colors cursor-pointer group"
            >
              <span className="font-sketch text-lg">{name}</span>
              <LogIn className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>

        {/* Add custom name */}
        <div className="mt-6 sketch-card p-4">
          <p className="font-sketch text-sm mb-2 flex items-center gap-1.5">
            <UserPlus className="h-4 w-4" /> לא מוצאים את השם שלכם?
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="הקלידו את השם שלכם"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomName()}
              className="flex-1"
              dir="rtl"
            />
            <button
              onClick={handleAddCustomName}
              disabled={!customName.trim() || adding}
              className="sketch-btn text-sm px-4 disabled:opacity-50 flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" /> הצטרפו
            </button>
          </div>
        </div>

        {studentNames.length === 0 && (
          <div className="sketch-card text-center p-6 mt-4">
            <p className="font-hand text-muted-foreground">אין סטודנטים בכיתה זו עדיין — הוסיפו את שמכם למעלה</p>
          </div>
        )}
      </div>
    </div>
  );
}
