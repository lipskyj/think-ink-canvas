import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  empathy_map:
    "Empathy Map: A tool to understand the user by mapping what they Say, Think, Do, and Feel. The user should describe their target user and fill in each quadrant.",
  converge:
    "Converge: Cluster empathy map observations into themes, write insight statements (Despite/Because/Therefore), classify problem types, generate grounded HMW questions, and choose intervention levels.",
  user_persona:
    "User Persona: Create a fictional but realistic profile of the target user including name, age, occupation, goals, frustrations, and a bio.",
  jtbd:
    "Jobs To Be Done: Define the jobs users are trying to accomplish using 'When [situation], I want to [motivation], so I can [outcome]'. Explore functional, emotional, and social dimensions. Identify hiring criteria.",
  journey_map:
    "Journey Map: Visualize the user's experience over time through stages. Map actions, thoughts, feelings, pain points, and opportunities at each stage.",
  prd_generator:
    "PRD Generator: Compile all design thinking data into a structured Product Requirements Document ready for text-to-code systems.",
  pov_statement:
    "POV Statement: Frame the design challenge as '[User] needs [need] because [insight]'.",
  how_might_we:
    "How Might We: Turn POV insights into opportunity questions starting with 'How might we...'.",
  five_whys:
    "Five Whys: Ask 'why?' five times to drill from a surface problem down to a root cause.",
  ideation:
    "Ideation: Generate as many ideas as possible. Quantity over quality. Defer judgment, build on others' ideas.",
  assumption_selection:
    "Assumption Selection: Identify what must be true for your solution to succeed. Pick the riskiest assumptions and define how you'll test them.",
  storyboard:
    "Storyboard: Sketch a sequence of scenes showing how the user interacts with the solution.",
  prototype_brief:
    "Prototype Brief: Define what to prototype — scope, key features, assumptions to test, and fidelity level.",
  user_testing:
    "User Testing: Let users interact with prototypes to gather evidence. Document test sessions, capture observations, then iterate.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stepKey, stepTitle, mode, currentData, previousData, sectionKey, sectionPrompt, pitchStyle, pitchStyleTitle, pitchStyleHint, pitchSlideTitles } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const stepDesc = STEP_DESCRIPTIONS[stepKey] || stepTitle;

    let contextBlock = "";
    if (previousData && Object.keys(previousData).length > 0) {
      contextBlock = "\n\nContext from previous design thinking steps:\n";
      for (const [title, data] of Object.entries(previousData)) {
        contextBlock += `\n--- ${title} ---\n${JSON.stringify(data, null, 2)}\n`;
      }
    }

    let currentBlock = "";
    if (currentData && Object.keys(currentData).length > 0) {
      currentBlock = `\n\nUser's current work on ${stepTitle}:\n${JSON.stringify(currentData, null, 2)}`;
    }

    let systemPrompt = "";
    let userMessage = "";

    if (mode === "section") {
      // Section-level AI: ONE short, focused suggestion for this specific field
      systemPrompt = `You are a design thinking facilitator. The user is working on: ${stepDesc}

They need help with the "${sectionKey}" field specifically.
${sectionPrompt || ""}
${contextBlock}${currentBlock}

RULES:
- Reply with exactly ONE concrete suggestion they can directly copy-paste into the field.
- Maximum 2 sentences.
- You MUST base your suggestion on the user's actual data from previous steps. Read their context carefully — what domain, what user, what problem they described.
- If no previous data exists, ask them to fill in earlier steps first rather than inventing a random domain.
- NEVER invent a new domain, user type, or problem that isn't present in their data. Stay strictly within what they have written.
- No preamble, no "Here's a suggestion:", just the content itself.
- ALWAYS respond in Hebrew.`;

      userMessage = `Give me one short, specific suggestion for the "${sectionKey}" field.`;

    } else if (mode === "coherence") {
      // Coherence check: detect deviation between problem definition and solution
      systemPrompt = `You are a design thinking coherence checker. Your job is to verify that the user's solution-phase work stays aligned with their problem definition.

Compare the user's current work in the ${stepDesc} step against their previous problem definition work:
${contextBlock}${currentBlock}

Analyze coherence across these dimensions:
1. **User alignment**: Is the solution still addressing the same user/persona defined earlier?
2. **Problem alignment**: Does the solution address the root cause identified (e.g., from Five Whys, POV Statement)?
3. **Job alignment**: Does it serve the primary job identified in JTBD?
4. **Scope drift**: Has the solution drifted to solve a DIFFERENT problem than originally defined?

Be specific. If you detect a deviation, explain:
- What the original problem/user was
- How the current work diverges
- A concrete suggestion to realign

Example: "Your empathy map focused on teachers struggling with GRADING, but your ideation focuses on EXAM GENERATION. These are related but different problems. Consider: are you solving the pain of checking exams (original problem) or creating exams (new scope)?"

If everything is well-aligned, say so briefly and encourage the user. Keep your response under 150 words.`;

      userMessage = "Check if my current work is coherent with my problem definition.";

    } else if (mode === "why_suggestions") {
      // Five Whys: generate 3 suggestion options for a specific why level
      const whyIndex = currentData?.whyIndex ?? 0;
      const whyChain = (currentData?.whys || []).slice(0, whyIndex).filter((w: string) => w.trim());
      const problemText = currentData?.problem || "";

      systemPrompt = `You are a design thinking facilitator helping with the Five Whys technique.
The user defined this problem: "${problemText}"
${whyChain.length > 0 ? `Previous answers in the chain:\n${whyChain.map((w: string, i: number) => `למה ${i + 1}: ${w}`).join("\n")}` : ""}
${contextBlock}

Now generate exactly 3 different possible answers for "למה ${whyIndex + 1}" (why #${whyIndex + 1}).
Each answer should dig deeper than the previous why level. Each should be a different angle or perspective.
Return ONLY a JSON array of 3 strings. No markdown, no explanation, just the JSON array.
Example: ["תשובה א", "תשובה ב", "תשובה ג"]
ALWAYS respond in Hebrew.`;

      userMessage = `Generate 3 possible answers for why #${whyIndex + 1}.`;

    } else if (mode === "prd_generate") {
      const additionalNotes = currentData?.additionalNotes || "";
      systemPrompt = `You are a senior product manager who translates design thinking research into structured PRD documents for text-to-code AI systems (like Lovable, Cursor, Bolt, etc.).

You will receive data from up to 13 design thinking steps. Your job is to synthesize ALL available data into a comprehensive, well-structured PRD in Markdown format.

The PRD should follow this structure:

# מסמך דרישות מוצר (PRD)

## 1. סקירת המוצר
תיאור קצר של המוצר והבעיה שהוא פותר.

## 2. משתמש היעד
מי המשתמש המרכזי? (מפרסונה, מפת אמפתיה)
- דמוגרפיה, מטרות, תסכולים, התנהגויות
- ציטוט מפתח שלוכד את הלך הרוח שלו

## 3. הגדרת הבעיה
הבעיה המרכזית שאנחנו פותרים (מ-POV, חמישה למה)
- ניתוח סיבת השורש
- למה פתרונות קיימים נכשלים

## 4. משימות וצרכים של המשתמש
מה המשתמש מנסה להשיג (מ-JTBD)
- משימות פונקציונליות
- משימות רגשיות
- משימות חברתיות

## 5. מסע המשתמש
שלבי מפתח שהמשתמש עובר (ממפת המסע)
- נקודות כאב בכל שלב
- הזדמנויות לשיפור

## 6. סקירת הפתרון
גישת הפתרון שנבחרה (מאידאציה, HMW)
- קונספט מרכזי
- איך הוא מטפל בסיבת השורש

## 7. תכונות מפתח
רשימת תכונות מתועדפת (מבריף האב-טיפוס, אידאציה)
- תכונות Must-have
- תכונות Nice-to-have

## 8. תרחיש משתמש / סטוריבורד
איך המשתמש מתקשר עם המוצר (מהסטוריבורד)
- תרחיש שלב-אחר-שלב

## 9. הנחות וסיכונים
הנחות קריטיות לאימות (מבחירת הנחות)
- מה חייב להיות נכון להצלחה

## 10. קריטריוני הצלחה
איך נמדוד הצלחה (מבדיקות משתמשים, בריף)
- מדדים מרכזיים
- תובנות מבדיקות (אם זמינות)

## 11. הערות טכניות
כל דרישה או אילוץ טכני שצוין.

${additionalNotes ? `\nהערות נוספות מהמשתמש:\n${additionalNotes}` : ""}

RULES:
- Only include sections where you have actual data. Skip sections with no data.
- Be specific and actionable — this document will be pasted into an AI code generator.
- Use concrete details from the user's research, not generic placeholders.
- Write feature descriptions as if briefing a developer.
- Output in HEBREW. All headings, descriptions, and body text must be in Hebrew. Keep technical terms (React, API, MVP, etc.) in English where natural.
- Format as clean Markdown ready to copy-paste.
- If data is sparse, still produce the best possible PRD from what's available, noting gaps.
${contextBlock}`;

      userMessage = `Generate a comprehensive PRD from all my design thinking work.${currentBlock}`;

    } else if (mode === "unstuck") {
      systemPrompt = `אתה מנטור האקתון נמרץ. הצוות תקוע בשלב: ${stepDesc}.
${contextBlock}${currentBlock}

תן בדיוק שתי שורות בעברית:
שורה 1: משפט קונקרטי אחד שהם יכולים לכתוב/לעשות בדקה הקרובה.
שורה 2: שאלה פרובוקטיבית אחת שתשבור להם את הראש.
בלי מבוא, בלי "הנה". יד על הכתף, קצר, אנרגטי, ב-yo voice של חבר.`;
      userMessage = "אנחנו תקועים. תן לנו דחיפה.";

    } else if (mode === "challenge") {
      systemPrompt = `אתה מנטור האקתון שעובר בין השולחנות. הצוות עובד על: ${stepDesc}.
${contextBlock}${currentBlock}

נתח את העבודה הנוכחית שלהם וחזור בשתי שורות בעברית בלבד:
שורה 1: הנקודה הכי חלשה בעבודה הנוכחית.
שורה 2: שיפור קונקרטי שאפשר ליישם תוך 5 דקות.
ישיר, לא מנומס מדי, בגובה העיניים. אסור להמציא דאטה שלא נמסר.`;
      userMessage = "תקוף את העבודה הנוכחית שלנו.";

    } else if (mode === "pitch_generate") {
      const slideTitlesList = Array.isArray(pitchSlideTitles) && pitchSlideTitles.length
        ? pitchSlideTitles
        : ["הבעיה", "המשתמש", "התובנה", "הפתרון", "דמו + ASK"];
      const slidesSchema = slideTitlesList
        .map((t: string, i: number) => `    {"title":"${t}", "subtitle":"...", "bullets":["...","...","..."], "visualHint":"..."}${i < slideTitlesList.length - 1 ? "," : ""}`)
        .join("\n");

      systemPrompt = `You generate a hackathon pitch in Hebrew in the style: ${pitchStyleTitle || "Classic"}.
Style guidance: ${pitchStyleHint || "Energetic, problem→solution."}

Using the team's design thinking data below, return JSON with EXACTLY this shape (no markdown fences, no prose, just JSON):
{
  "script": "60-second pitch script in Hebrew, ~150 words, matching the style above. Plain text with line breaks.",
  "slides": [
${slidesSchema}
  ],
  "speakerNotes": [
    "1-2 sentences of speaker notes for slide 1",
    "... one per slide, same length as slides array"
  ],
  "judging": [
    {"criterion":"בהירות הבעיה","question":"האם ברור מי המשתמש ומה כואב?"},
    {"criterion":"תובנה","question":"יש כאן משהו לא טריוויאלי?"},
    {"criterion":"התאמת פתרון","question":"הפתרון באמת עונה על הבעיה?"},
    {"criterion":"דמו","question":"זה עובד? מרגיש אמיתי?"},
    {"criterion":"אנרגיית הצוות","question":"הם מאמינים בזה?"}
  ]
}

CRITICAL RULES:
- Use EXACTLY the slide titles provided, in order: ${slideTitlesList.join(" / ")}
- Use concrete details from the team's actual data. Never invent a domain or user that isn't in their data.
- Each slide: 2-3 short bullets (max 8 words each). visualHint is one short suggestion for an image/icon.
- Hebrew throughout. Energetic, age-appropriate for young adults (16-25).
- Return ONLY the JSON object.
${contextBlock}`;
      userMessage = `Generate the pitch JSON in the "${pitchStyleTitle}" style for our team.`;

    } else if (mode === "suggest") {
      systemPrompt = `You are a design thinking facilitator helping with: ${stepDesc}
      
Based on the user's previous work, generate helpful suggestions and content for this step. Be specific, actionable, and creative. Use the context from previous steps to make suggestions relevant.${contextBlock}${currentBlock}

Provide 3-5 concrete suggestions. Be concise. Write in a warm, encouraging tone. ALWAYS respond in Hebrew.`;
      userMessage = `Please generate suggestions for my ${stepTitle}. Help me fill in this step effectively.`;

    } else {
      // review mode
      systemPrompt = `You are a design thinking reviewer helping with: ${stepDesc}

Review the user's current work and provide constructive feedback. Be specific about what's good and what could be improved.${contextBlock}${currentBlock}

Provide clear, actionable feedback. Be encouraging but honest. Write in a warm tone. ALWAYS respond in Hebrew.`;
      userMessage = `Please review my current ${stepTitle} work and suggest improvements.`;
    }

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
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated.";

    // For why_suggestions mode, parse JSON array from content
    if (mode === "why_suggestions") {
      try {
        // Strip markdown code fences if present
        const cleaned = content.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
        const suggestions = JSON.parse(cleaned);
        if (Array.isArray(suggestions)) {
          return new Response(JSON.stringify({ suggestions }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // Fallback: split by newlines
        const lines = content.split("\n").map((l: string) => l.replace(/^[\d\-\.\)]+\s*/, "").trim()).filter((l: string) => l);
        return new Response(JSON.stringify({ suggestions: lines.slice(0, 3) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
