import React from 'react';
import { Container as ContainerType } from '../types';
import { Box } from './Box';
import { MAX_BOXES_PER_CONTAINER, BOX_HEIGHT } from '../constants/constants';

interface ContainerProps {
    container: ContainerType;
    isCompleted: boolean;
    selectedBoxes: { containerId: number; boxIndices: number[] } | null;
    onClick: () => void;
}

export const Container: React.FC<ContainerProps> = ({ container, isCompleted, selectedBoxes, onClick }) => (
    <div
        className={`container ${isCompleted ? 'completed' : ''}`}
        style={{ height: `${MAX_BOXES_PER_CONTAINER * BOX_HEIGHT}px` }}
        onClick={onClick}
    >
        {container.boxes.map((box, boxIndex) => (
            <Box
                key={boxIndex}
                box={box}
                index={boxIndex}
                isSelected={selectedBoxes?.containerId === container.id && selectedBoxes.boxIndices.includes(boxIndex)}
            />
        ))}
    </div>
);