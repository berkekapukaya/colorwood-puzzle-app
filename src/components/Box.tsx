import React from 'react';
import { Box as BoxType } from '../types/index';
import { BOX_HEIGHT } from '../constants/constants';

interface BoxProps {
    box: BoxType;
    index: number;
    isSelected: boolean;
}

export const Box: React.FC<BoxProps> = ({ box, index, isSelected }) => (
    <div
        className={`box ${isSelected ? 'selected' : ''}`}
        style={{
            backgroundColor: box.color,
            bottom: `${index * BOX_HEIGHT}px`
        }}
    />
);