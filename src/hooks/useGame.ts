import { useState, useEffect, useCallback, useRef } from "react";
import { Container, Box, AnimatingBox, Move } from "../types/types";
import { createFixedBoxes, randomizeBoxes } from "../utils/utils";
import { MAX_BOXES_PER_CONTAINER, COLORS, BOX_SIZE, MAX_TAKE_BACKS } from "../constants/constants";

export const useGame = (key: number, onRestart: () => void) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedBoxes, setSelectedBoxes] = useState<{ containerId: number; boxIndices: number[] } | null>(null);
  const [completedContainers, setCompletedContainers] = useState<number[]>([]);
  const [isHardMode, setIsHardMode] = useState(false);
  const [animatingBoxes, setAnimatingBoxes] = useState<AnimatingBox[]>([]);
  const [containerPositions, setContainerPositions] = useState<(DOMRect | undefined)[]>([]);
  const [takeBacksUsed, setTakeBacksUsed] = useState(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const isMovingRef = useRef(false);

  const initializeGame = useCallback((hardMode: boolean) => {
    const allBoxes = createFixedBoxes();
    const initialContainers = randomizeBoxes(allBoxes);

    if (hardMode) {
      initialContainers.forEach((container) => {
        container.boxes.forEach((box, index) => {
          if (index !== container.boxes.length - 1) {
            box.hidden = true;
          }
        });
      });
    }

    setMoveHistory([]);
    setTakeBacksUsed(0);
    setContainers(initialContainers);
    setSelectedBoxes(null);
    setCompletedContainers([]);
    setIsHardMode(hardMode);
    setAnimatingBoxes([]);
    setIsMoving(false);
    isMovingRef.current = false;
  }, []);

  useEffect(() => {
    initializeGame(false);
  }, [key, initializeGame]);

  const toggleHardMode = () => {
    initializeGame(!isHardMode);
  };

  const checkForCompletedContainers = useCallback(() => {
    const newCompletedContainers = containers
      .filter((container) => {
        return (
          container.boxes.length === MAX_BOXES_PER_CONTAINER &&
          container.boxes.every((box) => !box.hidden && box.color === container.boxes[0].color)
        );
      })
      .map((container) => container.id);

    setCompletedContainers(newCompletedContainers);
  }, [containers]);

  useEffect(() => {
    checkForCompletedContainers();
  }, [containers, checkForCompletedContainers]);

  const checkValidMove = useCallback((fromContainerId: number, toContainerId: number, boxIndices: number[]) => {
    const fromContainer = containers.find(c => c.id === fromContainerId)!;
    const toContainer = containers.find(c => c.id === toContainerId)!;

    if (!fromContainer || !toContainer || fromContainer.boxes.length === 0) {
      return false;
    }

    const movingBoxes = boxIndices.map(index => fromContainer.boxes[index]);
    const movingColor = movingBoxes[0].color;

    return toContainer.boxes.length < MAX_BOXES_PER_CONTAINER &&
        (toContainer.boxes.length === 0 ||
            (!toContainer.boxes[toContainer.boxes.length - 1].hidden &&
                toContainer.boxes[toContainer.boxes.length - 1].color === movingColor));
  }, [containers]);

  const moveBoxes = useCallback(
    (fromContainerId: number, toContainerId: number, boxIndices: number[]) => {
      if (isMovingRef.current) return;
      if (completedContainers.includes(fromContainerId) || completedContainers.includes(toContainerId)) return;

      if (!checkValidMove(fromContainerId, toContainerId, boxIndices)) {
        setSelectedBoxes(null);
        return;
      }
      if (completedContainers.includes(fromContainerId) || completedContainers.includes(toContainerId)) return;

      const fromContainer = containers.find((c) => c.id === fromContainerId)!;
      const toContainer = containers.find((c) => c.id === toContainerId)!;

      if (!fromContainer || !toContainer || fromContainer.boxes.length === 0) {
        console.error("Invalid container or empty source container");
        setSelectedBoxes(null);
        return;
      }

      const fromContainerIndex = containers.findIndex((c) => c.id === fromContainerId);
      const toContainerIndex = containers.findIndex((c) => c.id === toContainerId);

      const fromRect = containerPositions[fromContainerIndex];
      const toRect = containerPositions[toContainerIndex];

      if (!fromRect || !toRect) {
        console.error("Container positions not available");
        setSelectedBoxes(null);
        return;
      }

      const reverseBoxIndices = boxIndices.slice().reverse();
      const movingBoxes = boxIndices.map((index) => fromContainer.boxes[index]);
      const movingColor = movingBoxes[0].color;

      const isValidMove =
        toContainer.boxes.length < MAX_BOXES_PER_CONTAINER &&
        (toContainer.boxes.length === 0 ||
          (!toContainer.boxes[toContainer.boxes.length - 1].hidden &&
            toContainer.boxes[toContainer.boxes.length - 1].color === movingColor));

      if (!isValidMove) {
        setSelectedBoxes(null);
        return;
      }

      setIsMoving(true);
      isMovingRef.current = true;

      const moveX = toRect.left - fromRect.left;
      const availableSpace = MAX_BOXES_PER_CONTAINER - toContainer.boxes.length;
      const boxesToMove = movingBoxes.slice(0, availableSpace);
      const boxIndicesToMove = reverseBoxIndices.slice(0, availableSpace);
      const boxesToSlide = reverseBoxIndices.slice(availableSpace);

      const newMove: Move = {
        fromContainerId,
        toContainerId,
        boxIndices: boxIndicesToMove,
        boxes: boxesToMove,
      };

      setMoveHistory((prev) => [...prev, newMove]);

      const newAnimatingBoxes = boxesToMove.map((box, index) => {
        const moveY = 0;
        return {
          id: `${fromContainerId}-${boxIndicesToMove[index]}`,
          sourceContainerId: fromContainerId,
          targetContainerId: toContainerId,
          moveX,
          moveY,
          initialY: (boxIndices.length - index - 1) * BOX_SIZE,
        };
      });

      const slidingBoxes = boxesToSlide.map((index) => ({
        id: `${fromContainerId}-${index}`,
        sourceContainerId: fromContainerId,
        targetContainerId: fromContainerId,
        moveX: 0,
        moveY: 0,
        initialY: (boxIndices.length - 1) * BOX_SIZE,
        isSliding: true,
      }));

      setAnimatingBoxes([...newAnimatingBoxes, ...slidingBoxes]);

      const timeout = Math.min(800 + Math.abs(moveX) / 2, 950);

      const timer = setTimeout(() => {
        setContainers((prevContainers) => {
          const newContainers = prevContainers.map((container) => {
            if (container.id === fromContainerId) {
              const newBoxes = container.boxes.filter((_, index) => !boxIndicesToMove.includes(index));
              if (isHardMode && newBoxes.length > 0) {
                newBoxes[newBoxes.length - 1] = { ...newBoxes[newBoxes.length - 1], hidden: false };
              }
              return { ...container, boxes: newBoxes };
            }
            if (container.id === toContainerId) {
              return { ...container, boxes: [...container.boxes, ...boxesToMove] };
            }
            return container;
          });

          return newContainers;
        });
        setAnimatingBoxes([]);
        setSelectedBoxes(null);
        setIsMoving(false);
        isMovingRef.current = false;
      }, timeout);

      return () => {
        clearTimeout(timer);
        setIsMoving(false);
        isMovingRef.current = false;
      };
    },
    [containers, completedContainers, containerPositions, isHardMode, checkValidMove],
  );

  const selectVisibleBoxesFromContainer = useCallback((container: Container) => {
    if (container.boxes.length === 0) return null;

    const topBox = container.boxes[container.boxes.length - 1];
    if (!topBox || topBox.hidden) return null;

    let selectedIndices: number[] = [container.boxes.length - 1];

    for (let i = container.boxes.length - 2; i >= 0; i--) {
      const box = container.boxes[i];
      if (!box) break;
      if (!box.hidden && box.color === topBox.color) {
        selectedIndices.push(i);
      } else {
        break;
      }
    }

    return selectedIndices.length > 0 ? { containerId: container.id, boxIndices: selectedIndices.reverse() } : null;
  }, []);



  const handleContainerClick = useCallback((containerId: number) => {
    if (isMovingRef.current) return;
    if (completedContainers.includes(containerId)) return;

    const containerIndex = containers.findIndex(c => c.id === containerId);
    if (containerIndex === -1) return;

    const container = containers[containerIndex];

    if (selectedBoxes === null) {
      const newSelection = selectVisibleBoxesFromContainer(container);
      setSelectedBoxes(newSelection);
    } else {
      if (selectedBoxes.containerId !== containerId) {
        const isValidMove = checkValidMove(selectedBoxes.containerId, containerId, selectedBoxes.boxIndices);

        if (isValidMove) {
          moveBoxes(selectedBoxes.containerId, containerId, selectedBoxes.boxIndices);
        } else {
          // Instead of just deselecting, we select the new container
          const newSelection = selectVisibleBoxesFromContainer(container);
          setSelectedBoxes(newSelection);
        }
      } else {
        setSelectedBoxes(null);
      }
    }
  }, [containers, selectedBoxes, completedContainers, moveBoxes, selectVisibleBoxesFromContainer, checkValidMove]);

  const undoLastMove = useCallback(() => {
    if (isMovingRef.current || moveHistory.length === 0 || takeBacksUsed >= MAX_TAKE_BACKS) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const fromContainer = containers.find((c) => c.id === lastMove.fromContainerId)!;
    const toContainer = containers.find((c) => c.id === lastMove.toContainerId)!;

    const fromContainerIndex = containers.findIndex((c) => c.id === lastMove.fromContainerId);
    const toContainerIndex = containers.findIndex((c) => c.id === lastMove.toContainerId);

    const fromRect = containerPositions[fromContainerIndex];
    const toRect = containerPositions[toContainerIndex];

    if (!fromRect || !toRect) return;

    const moveX = fromRect.left - toRect.left;

    setIsMoving(true);
    isMovingRef.current = true;

    const newAnimatingBoxes = lastMove.boxes.map((box, index) => {
      const moveY = 0;
      return {
        id: `${lastMove.toContainerId}-${toContainer.boxes.length - index - 1}`,
        sourceContainerId: lastMove.toContainerId,
        targetContainerId: lastMove.fromContainerId,
        moveX,
        moveY,
        initialY: (toContainer.boxes.length - index - 1) * BOX_SIZE,
      };
    });

    setAnimatingBoxes(newAnimatingBoxes);

    const timeout = Math.min(800 + Math.abs(moveX) / 2, 950);

    const timer = setTimeout(() => {
      setContainers((prevContainers) => {
        const newContainers = prevContainers.map((container) => {
          if (container.id === lastMove.fromContainerId) {
            return { ...container, boxes: [...container.boxes, ...lastMove.boxes] };
          }
          if (container.id === lastMove.toContainerId) {
            const newBoxes = container.boxes.slice(0, -lastMove.boxes.length);
            if (isHardMode && newBoxes.length > 0) {
              newBoxes[newBoxes.length - 1] = { ...newBoxes[newBoxes.length - 1], hidden: true };
            }
            return { ...container, boxes: newBoxes };
          }
          return container;
        });

        return newContainers;
      });
      setAnimatingBoxes([]);
      setMoveHistory((prev) => prev.slice(0, -1));
      setTakeBacksUsed((prev) => prev + 1);
      setIsMoving(false);
      isMovingRef.current = false;
    }, timeout);

    return () => {
      clearTimeout(timer);
      setIsMoving(false);
      isMovingRef.current = false;
    };
  }, [containers, containerPositions, isHardMode, moveHistory]);

  return {
    containers,
    selectedBoxes,
    completedContainers,
    handleContainerClick,
    isGameComplete: completedContainers.length === COLORS.length,
    isHardMode,
    toggleHardMode,
    animatingBoxes,
    setContainerPositions,
    undoLastMove,
    canUndo: moveHistory.length > 0 && takeBacksUsed < MAX_TAKE_BACKS,
    isMoving,
  };
};
