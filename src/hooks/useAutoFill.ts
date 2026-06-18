import { useEffect, useRef } from "react";
import { getLinkedData } from "@/lib/dataLinks";
import { useProject } from "@/contexts/ProjectContext";

/**
 * Auto-fill empty fields from linked data on mount.
 * @param stepKey - the current step key
 * @param fields - record of field names → { value, setter } for each auto-fillable field
 */
export function useAutoFill(
  stepKey: string,
  fields: Record<string, { value: string; set: (v: string) => void }>
) {
  const { stepData, getStepData } = useProject();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;

    const saved = getStepData(stepKey);
    const links = getLinkedData(stepKey, stepData);
    if (links.length === 0) return;

    let filled = false;
    for (const link of links) {
      if (link.field.startsWith("_")) continue;
      const fieldDef = fields[link.field];
      if (!fieldDef) continue;

      const savedVal = saved?.[link.field];
      // Only auto-fill if both saved and current are empty
      if (!savedVal?.toString().trim() && !fieldDef.value.trim()) {
        fieldDef.set(link.value);
        filled = true;
      }
    }
    if (filled) didRun.current = true;
  }, [stepData, stepKey, fields, getStepData]);
}
