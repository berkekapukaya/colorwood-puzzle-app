import React from 'react';
import { useGame } from '../hooks/useGame';
import { Container } from '../components/Container';
import '../styles/Game.css';

const Game_alt: React.FC = () => {
    const { containers, selectedBoxes, completedContainers, handleContainerClick } = useGame();

    return (
        <div>
            <div className="game">
                {containers.map(container => (
                    <Container
                        key={container.id}
                        container={container}
                        isCompleted={completedContainers.includes(container.id)}
                        selectedBoxes={selectedBoxes}
                        onClick={() => handleContainerClick(container.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Game_alt;