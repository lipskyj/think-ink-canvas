import { useState } from "react";
import { Link2, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { getLinkedData } from "@/lib/dataLinks";
import { useProject } from "@/contexts/ProjectContext";
import { getStepByKey } from "@/lib/steps";

interface LinkedDataBannerProps {
  stepKey: string;
  onApplyField?: (field: string, value: string) => void;
}

export default function LinkedDataBanner({ stepKey, onApplyField }: LinkedDataBannerProps) {
  const { stepData } = useProject();
  const [expanded, setExpanded] = useState(false);

  const links = getLinkedData(stepKey, stepData);
  const visibleLinks = links.filter((l) => !l.field.startsWith("_"));

  if (visibleLinks.length === 0) return null;

  return (
    <div className="sketch-border-thin bg-accent/30 p-3 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 text-right"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium">
            {visibleLinks.length} תובנ{visibleLinks.length > 1 ? "ות מקושרות" : "ה מקושרת"} זמינ{visibleLinks.length > 1 ? "ות" : "ה"} משלבים קודמים
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {visibleLinks.map((link, i) => {
            const sourceStep = getStepByKey(link.sourceStep);
            return (
              <div
                key={i}
                className="flex items-start gap-2 p-2 rounded-sm bg-background/50 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {sourceStep?.emoji} {sourceStep?.title} ← <strong>{link.field}</strong>
                  </p>
                  <p className="text-sm truncate">{link.value}</p>
                </div>
                {onApplyField && (
                  <button
                    onClick={() => onApplyField(link.field, link.value)}
                    className="shrink-0 text-xs px-2 py-1 sketch-border-thin hover:bg-secondary transition-colors flex items-center gap-1 opacity-70 group-hover:opacity-100"
                    title="החל ערך זה"
                  >
                    החל <ArrowLeft className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
