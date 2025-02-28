import { COLORS, BOXES_PER_COLOR, MAX_BOXES_PER_CONTAINER, INITIAL_EMPTY_CONTAINERS } from "../constants/constants";
import { Box, Container } from "../types/types";

export const createFixedBoxes = (): Box[] => {
  return COLORS.flatMap(color =>
      Array.from({ length: BOXES_PER_COLOR }, () => ({ color, hidden: false }))
  ).sort(() => Math.random() - 0.5);
};

export const randomizeBoxes = (boxes: Box[]): Container[] => {
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
