export interface Box {
    color: string;
}

export interface Container {
    id: number;
    size: number;
    boxes: Box[];
}

export interface AnimatingBox extends Box {
    id: string;
    sourceContainerId: number;
    targetContainerId: number;
    sourcePosition: { top: number; left: number };
    targetPosition: { top: number; left: number };
}

// Add this line at the end of the file if there are no other exports
export {};