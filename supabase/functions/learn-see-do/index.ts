import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LSDPayload {
  stepKey?: string;
  stepTitle?: string;
  stepDescription?: string;
  whyItMatters?: string;
  theme?: string;
  context?: { user?: string; need?: string; insight?: string; hmw?: string; problem?: string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { stepKey, stepTitle, stepDescription, whyItMatters, theme, context }: LSDPayload =
      await req.json();
    if (!stepKey || !stepTitle) {
      return new Response(JSON.stringify({ error: "missing step info" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const themeBlock = theme?.trim()
      ? `נושא ההאקתון: "${theme.trim()}"`
      : "אין נושא ספציפי — הביאו דוגמה מחיי בית הספר בישראל.";
    const ctxLines: string[] = [];
    if (context?.user) ctxLines.push(`משתמש: ${context.user}`);
    if (context?.problem) ctxLines.push(`בעיה: ${context.problem}`);
    if (context?.need) ctxLines.push(`צורך: ${context.need}`);
    if (context?.insight) ctxLines.push(`תובנה: ${context.insight}`);
    if (context?.hmw) ctxLines.push(`HMW: ${context.hmw}`);
    const ctxBlock = ctxLines.length ? `\nמה הצוות כבר עשה:\n${ctxLines.join("\n")}` : "";

    const systemPrompt = `אתה מנוע פדגוגי להאקתון נוער בישראל. הטון: מדריך טוב, חד, אנרגטי, חברי — כמו מד״צ או מנטור טק. לא פרופסור, לא תאגיד, לא AI סטרילי. עברית מדוברת של תיכוניסטים. אסור: ״תלמידים יקרים״, פירוט תאורטי, אזכור וידאו.

השלב הנוכחי: ${stepTitle}
תיאור השלב: ${stepDescription || ""}
${whyItMatters ? `למה זה חשוב: ${whyItMatters}` : ""}

${themeBlock}${ctxBlock}

החזר JSON תקני (בלי קוד-בלוקים, בלי הסברים) בדיוק במבנה:
{
  "learn": "פסקה אחת חדה (50-80 מילים) של היפוך תפיסה לשלב הזה ספציפית. וו תרבותי ישראלי (מזנון, בגרויות, ביט, וואטסאפ, חוצפה כיתרון). בלי תאוריה, בלי הקדמות.",
  "see": {
    "context": "משפט אחד: תלמיד פיקטיבי + סיטואציה ספציפית, מותאם לנושא אם קיים.",
    "execution": "2-3 משפטים מוחשיים שמדגימים איך התלמיד הזה ביצע את השלב הזה. דוגמאות מילוליות אמיתיות (״כתבתי X״, ״עליתי על Y״), לא הסבר."
  }
}

חשוב: רק עברית. בלי שדה do — הוא מתבצע בעמוד עצמו. אם יש נושא או נתונים מהצוות — חבר אליהם בדוגמה.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `הפק תוכן Learn/See לשלב ״${stepTitle}״.` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const txt = await response.text();
      console.error("AI gateway error:", status, txt);
      if (status === 429)
        return new Response(JSON.stringify({ error: "rate_limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (status === 402)
        return new Response(JSON.stringify({ error: "credits" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error("ai_error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify({ lsd: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("learn-see-do error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
