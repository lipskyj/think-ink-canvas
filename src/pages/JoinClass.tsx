import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClass } from "@/contexts/ClassContext";
import { Loader2 } from "lucide-react";

interface ClassRow {
  id: string;
  name: string;
  student_names: string[];
  leader_name: string | null;
}

/**
 * Auto-join: validate the class exists, set a placeholder session, then drop
 * the user into the long Team editor. The Team page asks for the user's name
 * the first time around and decides leader status from there.
 */
export default function JoinClass() {
  const { classId } = useParams<{ classId: string }>();
  const { setSession } = useClass();
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!classId) {
      setStatus("missing");
      return;
    }
    supabase
      .from("classes")
      .select("id, name, student_names, leader_name")
      .eq("id", classId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus("missing");
          return;
        }
        const cls = data as ClassRow;
        // Restore prior identity for this class from localStorage if available
        const remembered = (() => {
          try { return localStorage.getItem(`class:${cls.id}:name`) || ""; } catch { return ""; }
        })();
        setSession({
          classId: cls.id,
          className: cls.name,
          studentName: remembered,
          isLeader: !!remembered && remembered === cls.leader_name,
        });
        setStatus("ready");
      });
  }, [classId, setSession]);

  if (status === "missing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="sketch-card text-center p-8 max-w-sm">
          <p className="font-sketch text-xl text-destructive mb-2">הקבוצה לא נמצאה</p>
          <p className="font-hand text-muted-foreground">בדקו שהקישור תקין</p>
        </div>
      </div>
    );
  }

  if (status === "ready") {
    return <Navigate to="/team" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
