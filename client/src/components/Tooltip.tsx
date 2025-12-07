/**
 * Tooltip Component
 * Beautiful animated tooltips for hover interactions
 */
import { ReactNode } from "react";
import "../styles/tooltip.css";

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, text, position = "top" }: TooltipProps) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip tooltip-${position}`}>
        <div className="tooltip-content">{text}</div>
        <div className="tooltip-arrow"></div>
      </div>
    </div>
  );
}
