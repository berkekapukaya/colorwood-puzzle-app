import React, { useState, useEffect } from "react";
import { Container, Box } from "../types/types";
import "../styles/Game.css";

const COLORS = ["red", "blue", "green", "purple"];
const TOTAL_BOXES = 16;
const BOXES_PER_COLOR = TOTAL_BOXES / COLORS.length;
const BOX_HEIGHT = 50; // pixels
const MAX_BOXES_PER_CONTAINER = 4;
const INITIAL_EMPTY_CONTAINERS = 2;

const Game: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>(() => {
    const createFixedBoxes = (): Box[] => {
      return COLORS.flatMap(color =>
          Array.from({ length: BOXES_PER_COLOR }, () => ({ color, hidden: false }))
      ).sort(() => Math.random() - 0.5);
    };

    const allBoxes = createFixedBoxes();
    const randomizeBoxes = (boxes: Box[]): Container[] => {
      const shuffled = [...boxes].sort(() => Math.random() - 0.5);
      const totalContainers = 4 + INITIAL_EMPTY_CONTAINERS; // 3 initial containers + empty ones
      const containers: Container[] = Array.from({ length: totalContainers }, (_, index) => ({
        id: index + 1,
        size: MAX_BOXES_PER_CONTAINER,
        boxes: [],
      }));

      shuffled.forEach((box) => {
        const availableContainers = containers.slice(0, 4).filter((c) => c.boxes.length < MAX_BOXES_PER_CONTAINER);
        const randomContainer = availableContainers[Math.floor(Math.random() * availableContainers.length)];
        randomContainer.boxes.push(box);
      });

      return containers;
    };

    return randomizeBoxes(allBoxes);
  });

  const [selectedBoxes, setSelectedBoxes] = useState<{ containerId: number; boxIndices: number[] } | null>(null);
  const [completedContainers, setCompletedContainers] = useState<number[]>([]);

  useEffect(() => {
    checkForCompletedContainers();
  }, [containers]);

  const checkForCompletedContainers = () => {
    const newCompletedContainers = containers
      .filter((container) => {
        return (
          container.boxes.length === BOXES_PER_COLOR &&
          container.boxes.every((box) => box.color === container.boxes[0].color)
        );
      })
      .map((container) => container.id);

    setCompletedContainers(newCompletedContainers);
  };

  const moveBoxes = (fromContainerId: number, toContainerId: number, boxIndices: number[]) => {
    if (completedContainers.includes(fromContainerId) || completedContainers.includes(toContainerId)) return;

    setContainers((prevContainers) => {
      const newContainers = prevContainers.map((container) => ({ ...container, boxes: [...container.boxes] }));
      const fromContainer = newContainers.find((c) => c.id === fromContainerId)!;
      const toContainer = newContainers.find((c) => c.id === toContainerId)!;

      const movingBoxes = boxIndices.map((index) => fromContainer.boxes[index]);
      const movingColor = movingBoxes[0].color;

      const isValidMove =
        toContainer.boxes.length === 0 || // Empty container is always valid
        toContainer.boxes[toContainer.boxes.length - 1].color === movingColor; // Top box color matches

      if (isValidMove) {
        const availableSpace = MAX_BOXES_PER_CONTAINER - toContainer.boxes.length;
        const boxesToMove = movingBoxes.slice(0, availableSpace);
        const boxesToKeep = movingBoxes.slice(availableSpace);

        // Remove all selected boxes from the source container
        fromContainer.boxes = fromContainer.boxes.filter((_, index) => !boxIndices.includes(index));

        // Add boxes to the destination container
        toContainer.boxes.push(...boxesToMove);

        // Return excess boxes to the source container
        fromContainer.boxes.push(...boxesToKeep);
      }

      return newContainers;
    });
  };

  const handleContainerClick = (containerId: number) => {
    if (completedContainers.includes(containerId)) return;

    const containerIndex = containers.findIndex((c) => c.id === containerId);
    if (containerIndex === -1) return; // Container not found

    const container = containers[containerIndex];

    const selectBoxesFromContainer = (container: Container) => {
      if (container.boxes.length === 0) return null; // Do nothing if the container is empty

      const topColor = container.boxes[container.boxes.length - 1].color;
      let selectedIndices: number[] = [];

      // Start from the top of the container and collect indices of boxes with the same color
      for (let i = container.boxes.length - 1; i >= 0; i--) {
        if (container.boxes[i].color === topColor) {
          selectedIndices.push(i);
        } else {
          break; // Stop when we encounter a different color
        }
      }

      return selectedIndices.length > 0 ? { containerId: container.id, boxIndices: selectedIndices } : null;
    };

    if (selectedBoxes === null) {
      // No boxes are currently selected, so select boxes from this container
      const newSelection = selectBoxesFromContainer(container);
      setSelectedBoxes(newSelection);
    } else {
      // Boxes are already selected, attempt to move them
      if (selectedBoxes.containerId !== containerId) {
        const fromContainer = containers.find((c) => c.id === selectedBoxes.containerId)!;
        const toContainer = container;
        const movingBoxes = selectedBoxes.boxIndices.map((index) => fromContainer.boxes[index]);
        const movingColor = movingBoxes[0].color;

        const isValidMove =
          toContainer.boxes.length === 0 || // Empty container is always valid
          toContainer.boxes[toContainer.boxes.length - 1].color === movingColor; // Top box color matches

        if (isValidMove) {
          moveBoxes(selectedBoxes.containerId, containerId, selectedBoxes.boxIndices);
          setSelectedBoxes(null);
        } else {
          // If move is invalid, select boxes from the clicked container instead
          const newSelection = selectBoxesFromContainer(container);
          setSelectedBoxes(newSelection);
        }
      } else {
        // Clicked on the same container, deselect
        setSelectedBoxes(null);
      }
    }
  };

  return (
    <div>
      <div className="game">
        {containers.map((container) => (
          <div
            key={container.id}
            className={`container ${completedContainers.includes(container.id) ? "completed" : ""}`}
            style={{ height: `${MAX_BOXES_PER_CONTAINER * BOX_HEIGHT}px` }}
            onClick={() => handleContainerClick(container.id)}
          >
            {container.boxes.map((box, boxIndex) => (
              <div
                key={boxIndex}
                className={`box ${selectedBoxes && selectedBoxes.containerId === container.id && selectedBoxes.boxIndices.includes(boxIndex) ? "selected" : ""}`}
                style={{
                  backgroundColor: box.color,
                  bottom: `${boxIndex * BOX_HEIGHT}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
