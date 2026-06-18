// Builds a real .pptx file from generated pitch data.
// Monochrome sketch aesthetic, RTL, Arial. Client-side only.

import PptxGenJS from "pptxgenjs";

interface Slide {
  title: string;
  bullets: string[];
  visualHint?: string;
}

interface PitchData {
  script: string;
  slides: Slide[];
  judging?: { criterion: string; question: string }[];
  speakerNotes?: string[];
}

export async function buildPitchDeck(
  pitch: PitchData,
  teamName: string,
  styleTitle: string,
  demoUrl?: string,
  coverImage?: string, // base64 data URL
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pptx.rtlMode = true;
  pptx.title = `${teamName || "Hackathon Pitch"} — ${styleTitle}`;

  const TEXT = "111111";
  const BG = "FAFAF7";
  const MUTED = "666666";
  const ACCENT = "222222";

  // --- Cover slide ---
  const cover = pptx.addSlide();
  cover.background = { color: BG };
  if (coverImage) {
    cover.addImage({ data: coverImage, x: 4.67, y: 0.5, w: 4, h: 2.2, sizing: { type: "contain", w: 4, h: 2.2 } });
  }
  cover.addText(teamName || "הצוות שלנו", {
    x: 0.5,
    y: coverImage ? 3.0 : 2.6,
    w: 12.3,
    h: 1.2,
    fontFace: "Arial",
    fontSize: 60,
    bold: true,
    color: TEXT,
    align: "center",
    rtlMode: true,
  });
  cover.addText(styleTitle, {
    x: 0.5,
    y: coverImage ? 4.3 : 3.9,
    w: 12.3,
    h: 0.6,
    fontFace: "Arial",
    fontSize: 22,
    color: MUTED,
    align: "center",
    rtlMode: true,
  });
  cover.addShape("line", {
    x: 5.5,
    y: coverImage ? 5.2 : 4.8,
    w: 2.3,
    h: 0,
    line: { color: TEXT, width: 2 },
  });


  // --- Content slides ---
  pitch.slides.forEach((slide, i) => {
    const s = pptx.addSlide();
    s.background = { color: BG };

    // Page number
    s.addText(`${i + 1} / ${pitch.slides.length}`, {
      x: 0.4,
      y: 7.0,
      w: 1.5,
      h: 0.3,
      fontFace: "Arial",
      fontSize: 10,
      color: MUTED,
    });

    // Title
    s.addText(slide.title, {
      x: 0.6,
      y: 0.6,
      w: 12.1,
      h: 1.0,
      fontFace: "Arial",
      fontSize: 40,
      bold: true,
      color: TEXT,
      align: "right",
      rtlMode: true,
    });

    // Divider line under title
    s.addShape("line", {
      x: 0.6,
      y: 1.7,
      w: 12.1,
      h: 0,
      line: { color: ACCENT, width: 1.5 },
    });

    // Bullets
    const bulletText = slide.bullets
      .filter((b) => b && b.trim())
      .map((b) => ({
        text: b,
        options: {
          bullet: { code: "25CF" },
          paraSpaceAfter: 12,
        },
      }));

    if (bulletText.length > 0) {
      s.addText(bulletText as any, {
        x: 0.6,
        y: 2.0,
        w: 12.1,
        h: 4.5,
        fontFace: "Arial",
        fontSize: 26,
        color: TEXT,
        align: "right",
        rtlMode: true,
        valign: "top",
      });
    }

    // Visual hint as footer note
    if (slide.visualHint) {
      s.addText(`🎨 ${slide.visualHint}`, {
        x: 0.6,
        y: 6.7,
        w: 12.1,
        h: 0.4,
        fontFace: "Arial",
        fontSize: 11,
        italic: true,
        color: MUTED,
        align: "right",
        rtlMode: true,
      });
    }

    // Speaker notes
    if (pitch.speakerNotes && pitch.speakerNotes[i]) {
      s.addNotes(pitch.speakerNotes[i]);
    }
  });

  // --- Thank you / closing slide ---
  const closing = pptx.addSlide();
  closing.background = { color: TEXT };
  closing.addText("תודה!", {
    x: 0.5,
    y: 2.6,
    w: 12.3,
    h: 1.4,
    fontFace: "Arial",
    fontSize: 80,
    bold: true,
    color: BG,
    align: "center",
    rtlMode: true,
  });
  closing.addText(teamName || "", {
    x: 0.5,
    y: 4.2,
    w: 12.3,
    h: 0.5,
    fontFace: "Arial",
    fontSize: 22,
    color: BG,
    align: "center",
    rtlMode: true,
  });
  if (demoUrl) {
    closing.addText(demoUrl, {
      x: 0.5,
      y: 5.0,
      w: 12.3,
      h: 0.4,
      fontFace: "Arial",
      fontSize: 16,
      color: BG,
      align: "center",
    });
  }

  await pptx.writeFile({ fileName: `pitch-${(teamName || "team").replace(/\s+/g, "-")}.pptx` });
}
