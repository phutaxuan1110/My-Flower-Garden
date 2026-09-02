import React, { createContext, useCallback, useContext, useState } from "react";

interface AddFlowContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const AddFlowContext = createContext<AddFlowContextValue | null>(null);

export function AddFlowProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return <AddFlowContext.Provider value={{ isOpen, open, close }}>{children}</AddFlowContext.Provider>;
}

export function useAddFlow(): AddFlowContextValue {
  const ctx = useContext(AddFlowContext);
  if (!ctx) throw new Error("useAddFlow must be used within AddFlowProvider");
  return ctx;
}
