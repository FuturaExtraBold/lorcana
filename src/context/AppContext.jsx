import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentHoverId, setCurrentHoverId] = useState(null);
  return (
    <AppContext.Provider
      value={{
        currentHoverId,
        setCurrentHoverId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHover() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useHover must be used within AppProvider");
  }
  return context;
}
