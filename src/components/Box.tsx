import React from "react";
import { Box as BoxType } from "../types/types";
import { BOX_SIZE } from "../constants/constants";

interface BoxProps {
  box: BoxType;
  index: number;
  isSelected: boolean;
  isAnimating: boolean;
  initialY: number;
  moveX: number;
  moveY: number;
  totalSelected: number;
  isSliding?: boolean;
  selectedBoxCount: number;
  toMove: number;
}

export const Box: React.FC<BoxProps> = React.memo(
  ({
    box,
    index,
    isSelected,
    isAnimating,
    moveX,
    moveY,
    totalSelected,
    initialY,
    isSliding,
    selectedBoxCount,
    toMove,
  }) => {
    return (
      <div
        className={`box ${isSelected ? "selected" : ""} ${isAnimating ? "animating" : ""} ${isSliding ? "sliding" : ""}`}
        style={{
          backgroundColor: box.hidden ? "#ccc" : box.color,
          bottom: `${index * BOX_SIZE}px`,
          transform: isSelected ? `translateY(${toMove}px)` : "none",
          ...(isAnimating &&
            ({
              "--moveX": `${moveX}px`,
              "--moveY": `${moveY}px`,
              "--initialY": `${toMove}px`,
            } as React.CSSProperties)),
        }}
      >
        {box.hidden && (
          <span
            style={{
              fontSize: "2em",
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            ?
          </span>
        )}
      </div>
    );
  },
);

Box.displayName = "Box";
