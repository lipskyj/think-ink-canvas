import { PITCH_STYLES, PitchStyleKey } from "@/lib/pitchStyles";
import { Check } from "lucide-react";

interface Props {
  selected: PitchStyleKey | null;
  onSelect: (key: PitchStyleKey) => void;
}

const PitchStylePicker = ({ selected, onSelect }: Props) => {
  return (
    <div dir="rtl">
      <h2 className="font-sketch text-2xl mb-1">איזה פיץ׳ אתם רוצים להציג?</h2>
      <p className="font-hand text-base text-muted-foreground mb-4">
        בחרו סגנון. ה-AI יבנה לכם סקריפט, מצגת וצ׳קליסט שיפוט מותאמים.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        {PITCH_STYLES.map((s) => {
          const isSelected = selected === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onSelect(s.key)}
              className={`text-right sketch-card p-4 hover:bg-secondary/30 transition-colors ${
                isSelected ? "ring-2 ring-foreground bg-secondary/40" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{s.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-sketch text-lg">{s.title}</h3>
                    {isSelected && <Check size={16} />}
                  </div>
                  <p className="font-hand text-sm font-semibold mb-1">{s.subtitle}</p>
                  <p className="font-hand text-xs text-muted-foreground">
                    {s.whenToUse}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {s.slideTitles.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-hand px-2 py-0.5 sketch-border-thin bg-background"
                  >
                    {i + 1}. {t}
                  </span>
                ))}
                {s.slideTitles.length > 4 && (
                  <span className="text-[10px] font-hand px-2 py-0.5 text-muted-foreground">
                    +{s.slideTitles.length - 4}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PitchStylePicker;
