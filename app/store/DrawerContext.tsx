// DrawerContext.tsx
"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react"

type DrawerStateContextType = {
  open: boolean;
  selectedId: SelectedId;
}
type DrawerActionsContextType = {
  openDrawer: (id: Exclude<SelectedId, null>) => void;
  closeDrawer: () => void;
}

type SelectedId = {
  clubId: number;
  date: string;
  time: number;
} | null;

const DrawerStateContext = createContext<DrawerStateContextType | undefined>(undefined)
const DrawerActionsContext = createContext<DrawerActionsContextType | undefined>(undefined)

export function DrawerContextProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<SelectedId>(null);

  const openDrawer = useCallback((id: { clubId: number; date: string; time: number }) => {
    setSelectedId(id);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false)
    setSelectedId(null)
  }, [])

  const actions = useMemo(() => ({ openDrawer, closeDrawer }), [openDrawer, closeDrawer])
  const state = useMemo(() => ({ open, selectedId }), [open, selectedId])

  return (
    <DrawerActionsContext value={actions}>
      <DrawerStateContext value={state}>
        {children}
      </DrawerStateContext>
    </DrawerActionsContext>
  )
}

export function useDrawerActions() {
  const context = useContext(DrawerActionsContext)
  if (!context) throw new Error("useDrawerActions must be used within provider")
  return context
}

export function useDrawerState() {
  const context = useContext(DrawerStateContext)
  if (!context) throw new Error("useDrawerState must be used within provider")
  return context
}
