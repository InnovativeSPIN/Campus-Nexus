import React from "react";
import { MentorContext } from "./MentorContext";

export function useMentor() {
  const context = React.useContext(MentorContext);
  if (!context) {
    throw new Error("useMentor must be used within MentorProvider");
  }
  return context;
}
