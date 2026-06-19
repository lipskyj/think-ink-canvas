// Visual style presets for team avatar generation.
// Each style ships with a Hebrew label, short description, a sample image,
// and the English prompt fragment sent to the image model.

import sampleNoam from "@/assets/style-noam.jpg";
import samplePixel from "@/assets/style-pixel.jpg";
import sampleAnime from "@/assets/style-anime.jpg";
import sampleComics from "@/assets/style-comics.jpg";
import sampleCaricature from "@/assets/style-caricature.jpg";
import sampleFlat from "@/assets/style-flat.jpg";
import sampleWatercolor from "@/assets/style-watercolor.jpg";
import sampleLowpoly from "@/assets/style-lowpoly.jpg";
import sampleSticker from "@/assets/style-sticker.jpg";

export type TeamAvatarStyleKey =
  | "noam"
  | "pixel"
  | "anime"
  | "comics"
  | "caricature"
  | "flat"
  | "watercolor"
  | "lowpoly"
  | "sticker";

export interface TeamAvatarStyle {
  key: TeamAvatarStyleKey;
  label: string;
  description: string;
  sample: string;
  prompt: string;
}


export const TEAM_AVATAR_STYLES: TeamAvatarStyle[] = [
  {
    key: "noam",
    label: "נועם",
    description: "סקיצה רכה, צבעים שטוחים, סגנון הבית",
    emoji: "✏️",
    prompt:
      "Flat-color cartoon illustration in a friendly storybook style: warm cream background, confident hand-drawn black outlines, soft flat colors (mustard yellow, coral pink, mint green, warm browns), expressive simple faces, slightly sketchy lines, modern children's-book feel, no gradients, no shading complexity, no photorealism, no text, no logos.",
  },
  {
    key: "pixel",
    label: "Pixel Art",
    description: "רטרו, 8-ביט, נוסטלגי",
    emoji: "👾",
    prompt:
      "16-bit pixel-art illustration, retro arcade game style, vibrant saturated colors, crisp pixel edges, limited palette, dramatic lighting, no text, no logos.",
  },
  {
    key: "anime",
    label: "אנימה",
    description: "עיניים גדולות, סגנון יפני",
    emoji: "🎌",
    prompt:
      "Modern Japanese anime illustration, large expressive eyes, sharp cel-shading, vibrant hair colors, dynamic pose, detailed background, no text, no logos.",
  },
  {
    key: "comics",
    label: "קומיקס",
    description: "קווים מודגשים, צבעים עזים",
    emoji: "💥",
    prompt:
      "Western comic book illustration, bold black ink outlines, halftone dot shading, saturated primary colors, dynamic action pose, dramatic angle, no text, no logos.",
  },
  {
    key: "caricature",
    label: "קריקטורה",
    description: "מוגזם, מצחיק, אקספרסיבי",
    emoji: "😜",
    prompt:
      "Exaggerated cartoon caricature, oversized heads, expressive funny faces, playful colors, energetic group composition, comedic feel, no text, no logos.",
  },
  {
    key: "flat",
    label: "Flat",
    description: "וקטור נקי, מודרני",
    emoji: "🧊",
    prompt:
      "Modern flat vector illustration, geometric shapes, clean lines, pastel corporate-style color palette, minimal shading, friendly diverse characters, no text, no logos.",
  },
  {
    key: "watercolor",
    label: "אקוורל",
    description: "כתמים רכים, ציורי",
    emoji: "🎨",
    prompt:
      "Soft watercolor illustration, organic paint bleeds, warm pastel palette, loose pencil sketch underneath, paper texture, dreamy artistic feel, no text, no logos.",
  },
  {
    key: "lowpoly",
    label: "Low Poly",
    description: "משולשים, תלת-מימד מודרני",
    emoji: "🔷",
    prompt:
      "Low-poly 3D illustration, faceted triangular geometry, gradient lighting, modern minimal palette, isometric framing, no text, no logos.",
  },
  {
    key: "sticker",
    label: "מדבקה",
    description: "מתאר עבה, ססגוני",
    emoji: "🌟",
    prompt:
      "Die-cut sticker style illustration, thick white outline around characters, bold saturated colors, glossy shading, playful group portrait centered on a plain background, no text, no logos.",
  },
];

export const getAvatarStyle = (key?: string | null): TeamAvatarStyle =>
  TEAM_AVATAR_STYLES.find((s) => s.key === key) || TEAM_AVATAR_STYLES[0];
