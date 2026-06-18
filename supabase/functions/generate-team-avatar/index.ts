// Generates a hand-drawn monochrome team avatar in Noam's hero style.
// Returns { dataUrl } — a base64 PNG the client stores on the class row.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Body {
  teamName?: string;
  members?: { name?: string; gender?: "male" | "female" | "other" }[];
  situation?: string;
}

const STYLE = [
  "Hand-drawn monochrome ink illustration, sketchy notebook aesthetic,",
  "black pen on cream paper, loose confident lines, slight cross-hatching,",
  "zine / storytelling vibe, expressive characters, no color, no background frame,",
  "centered composition on plain off-white paper, no text, no logos.",
].join(" ");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Body;
    const members = (body.members || []).filter((m) => m && (m.name || m.gender));
    const memberDesc = members.length
      ? members
          .map((m, i) => {
            const g =
              m.gender === "male"
                ? "young man"
                : m.gender === "female"
                ? "young woman"
                : "young person";
            return m.name ? `${g} (${m.name})` : g;
          })
          .join(", ")
      : "a small group of young people";

    const situation = (body.situation || "").trim() || "standing together, smiling, casual pose";

    const prompt = `${STYLE} A team portrait of ${memberDesc}. Situation: ${situation}. Group of ${
      members.length || 3
    } characters, full body, drawn in the same illustration style as a friendly storybook character.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned", raw: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ dataUrl: `data:image/png;base64,${b64}`, prompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
