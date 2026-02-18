import { useState } from "react";

type PanelState = "both" | "document" | "content";

export const usePanelState = () => {
  const [panelState, setPanelState] = useState<PanelState>("both");

  const handleDocumentExpand = () => {
    setPanelState(panelState === "document" ? "both" : "document");
  };

  const handleContentExpand = () => {
    setPanelState(panelState === "content" ? "both" : "content");
  };

  return {
    panelState,
    setPanelState,
    handleDocumentExpand,
    handleContentExpand,
  };
};
