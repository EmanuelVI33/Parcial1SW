import { createContext, useContext, useState } from "react";

const DiagramContext = createContext();

export function DiagramProvider({ children }) {
  const [selectedDiagram, setSelectedDiagram] = useState(null);

  return (
    <DiagramContext.Provider value={{ selectedDiagram, setSelectedDiagram }}>
      {children}
    </DiagramContext.Provider>
  );
}

export function useDiagramContext() {
  return useContext(DiagramContext);
}
