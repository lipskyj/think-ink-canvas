import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SectionHelperContextType {
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

const SectionHelperContext = createContext<SectionHelperContextType>({
  openId: null,
  setOpenId: () => {},
});

export function SectionHelperProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenIdState] = useState<string | null>(null);
  const setOpenId = useCallback((id: string | null) => setOpenIdState(id), []);

  return (
    <SectionHelperContext.Provider value={{ openId, setOpenId }}>
      {children}
    </SectionHelperContext.Provider>
  );
}

export const useSectionHelper = () => useContext(SectionHelperContext);
