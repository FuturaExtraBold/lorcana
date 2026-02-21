import { createContext, useContext, useState } from "react";

const HoverContext = createContext();

export function HoverProvider({ children }) {
  const [currentHoverId, setCurrentHoverId] = useState(null);

  return (
    <HoverContext.Provider value={{ currentHoverId, setCurrentHoverId }}>
      {children}
    </HoverContext.Provider>
  );
}

export function useHover() {
  const context = useContext(HoverContext);
  if (!context) {
    throw new Error("useHover must be used within HoverProvider");
  }
  return context;
}
