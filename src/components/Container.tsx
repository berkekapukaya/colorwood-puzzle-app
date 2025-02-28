import React, { forwardRef, useRef, useCallback, useMemo } from "react";
import { Container as ContainerType, AnimatingBox } from "../types/types";
import { Box } from "./Box";
import { MAX_BOXES_PER_CONTAINER, BOX_SIZE } from "../constants/constants";

interface ContainerProps {
  container: ContainerType;
  isCompleted: boolean;
  selectedBoxes: { containerId: number; boxIndices: number[] } | null;
  onClick: () => void;
  style?: React.CSSProperties;
  animatingBoxes: AnimatingBox[];
  isSliding?: boolean;
  allContainers: ContainerType[];
}

const MemoizedBox = React.memo(Box);

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ container, allContainers, isCompleted, selectedBoxes, isSliding, onClick, style, animatingBoxes }, ref) => {
    const lastCalculatedValues = useRef<number[]>([]);

    const calculateToMove = useCallback(
      (boxIndex: number, selectedBoxCount: number, containerLength: number): number => {
        if (boxIndex === 3 && selectedBoxCount === 1 && containerLength === 4) return -75;
        if ((boxIndex === 3 || boxIndex === 2) && selectedBoxCount === 2 && containerLength === 4) return -150;
        if ((boxIndex === 3 || boxIndex === 2 || boxIndex === 1) && selectedBoxCount === 3 && containerLength === 4)
          return -225;
        if (boxIndex === 2 && selectedBoxCount === 1 && containerLength === 3) return -150;
        if ((boxIndex === 2 || boxIndex === 1) && selectedBoxCount === 2 && containerLength === 3) return -225;
        if ((boxIndex === 2 || boxIndex === 1 || boxIndex === 0) && selectedBoxCount === 3 && containerLength === 3)
          return -300;
        if (boxIndex === 1 && selectedBoxCount === 1 && containerLength === 2) return -225;
        if ((boxIndex === 1 || boxIndex === 0) && selectedBoxCount === 2 && containerLength === 2) return -300;
        if (boxIndex === 0 && selectedBoxCount === 1 && containerLength === 1) return -300;
        return 0;
      },
      [],
    );

    const getToMove = useCallback(
      (boxIndex: number) => {
        if (selectedBoxes?.containerId === container.id && selectedBoxes.boxIndices.includes(boxIndex)) {
          // New selection, recalculate
          const newValue = calculateToMove(boxIndex, selectedBoxes.boxIndices.length, container.boxes.length);
          lastCalculatedValues.current[boxIndex] = newValue;
          return newValue;
        }
        // Not currently selected, return last calculated value or 0 if never calculated
        return lastCalculatedValues.current[boxIndex] || 0;
      },
      [selectedBoxes, container.id, container.boxes.length, calculateToMove],
    );

    const calculateMoveY = useCallback(
      (toMove: number, targetContainerId: number, containerLength: number, selectedBoxCount: number): number => {
        const targetContainer = allContainers.find((c) => c.id === targetContainerId);
        const targetBoxCount = targetContainer ? targetContainer.boxes.length : 0;

        console.log(selectedBoxCount)

        if (targetBoxCount === 0) {
          if (toMove === -75) return 225;
          if(toMove === -150) return 150;
          if(toMove === -225) return 75;
          if(toMove === -300) return 0;
        }else if (targetBoxCount === 1) {
            if (toMove === -75) return 150;
            if(toMove === -150) return 75;
            if(toMove === -225) return 0;
            if(toMove === -300) return -75;
        }else if(targetBoxCount === 2){
            if(selectedBoxCount === 3){
                if (toMove === -75) return 150;
                if(toMove === -150) return 75;
                if(toMove === -225) return 0;
                if(toMove === -300) return -75;
            }else{
                if (toMove === -75) return 75;
                if(toMove === -150) return 0;
                if(toMove === -225) return -75;
                if(toMove === -300) return -150;
            }
        }else if(targetBoxCount === 3){
            if(selectedBoxCount === 3){
                if (toMove === -75) return 150;
                if(toMove === -150) return 75;
                if(toMove === -225) return 0;
                if(toMove === -300) return -75;
            }else if(selectedBoxCount === 2){
                if (toMove === -75) return 75;
                if (toMove === -150) return 0;
                if (toMove === -225) return -75;
                if (toMove === -300) return -150;
            }else{
                if (toMove === -75) return 0;
                if(toMove === -150) return -75;
                if(toMove === -225) return -150;
                if(toMove === -300) return -225;
            }
        }
        return 0; // Default value if no conditions are met
      },
      [allContainers],
    );

    const animatingBoxesLookup = useMemo(() => {
      return animatingBoxes.reduce(
        (acc, box) => {
          acc[box.id] = box;
          return acc;
        },
        {} as Record<string, AnimatingBox>,
      );
    }, [animatingBoxes]);

    return (
      <div
        ref={ref}
        className={`container ${isCompleted ? "completed" : ""}`}
        style={{
          ...style,
          height: `${MAX_BOXES_PER_CONTAINER * BOX_SIZE}px`,
          pointerEvents: isCompleted ? "none" : "auto",
        }}
        onClick={onClick}
      >
        {container.boxes.map((box, boxIndex) => {
          const animatingBox = animatingBoxesLookup[`${container.id}-${boxIndex}`];
          const isSelected = selectedBoxes?.containerId === container.id && selectedBoxes.boxIndices.includes(boxIndex);
          const selectedBoxCount = selectedBoxes?.boxIndices.length || 0;
          const toMove = getToMove(boxIndex);
          const moveY = animatingBox
              ? calculateMoveY(toMove, animatingBox.targetContainerId, container.boxes.length, selectedBoxCount)
              : 0;

          return (
            <MemoizedBox
              key={boxIndex}
              box={box}
              index={boxIndex}
              isSelected={isSelected}
              selectedBoxCount={selectedBoxCount}
              isAnimating={!!animatingBox}
              moveX={animatingBox?.moveX || 0}
              moveY={moveY}
              initialY={animatingBox?.initialY || 0}
              totalSelected={selectedBoxCount}
              isSliding={animatingBox?.isSliding || false}
              toMove={toMove}
            />
          );
        })}
      </div>
    );
  },
);
