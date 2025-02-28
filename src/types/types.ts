export interface Box {
  color: string;
  hidden: boolean;
}

export interface Container {
  id: number;
  size: number;
  boxes: Box[];
}

export interface GameHeaderProps {
  isGameComplete: boolean;
  onRestart: () => void;
  isHardMode: boolean;
  toggleHardMode: () => void;
}

export interface AnimatingBox {
  id: string;
  sourceContainerId: number;
  targetContainerId: number;
  moveX: number;
  moveY: number;
  initialY: number;
  isSliding?: boolean;
}

export interface Move {
  fromContainerId: number;
  toContainerId: number;
  boxIndices: number[];
  boxes: Box[];
}


// Add this line at the end of the file if there are no other exports
export {};
