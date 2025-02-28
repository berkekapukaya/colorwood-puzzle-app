import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useGame } from "../hooks/useGame";
import { Container } from "../components/Container";
import GameHeader from "./GameHeader";
import "../styles/Game.css";

const GameAlt: React.FC = () => {
    const [gameKey, setGameKey] = useState(0);
    const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleRestart = useCallback(() => {
        setGameKey(prevKey => prevKey + 1);
    }, []);

    const {
        containers,
        selectedBoxes,
        completedContainers,
        handleContainerClick,
        isGameComplete,
        isHardMode,
        toggleHardMode,
        animatingBoxes,
        setContainerPositions,
        undoLastMove,
        canUndo,
        isMoving,
    } = useGame(gameKey, handleRestart);


    useEffect(() => {
        const positions = containerRefs.current.map(ref => ref?.getBoundingClientRect());
        setContainerPositions(positions);
    }, [containers, setContainerPositions]);

    // Calculate positions for containers
    const containerPositions = [
        { left: '50px', bottom: '20px' },
        { left: '175px', bottom: '20px' },
        { left: '300px', bottom: '20px' },
        { left: '425px', bottom: '20px' },
        { left: '550px', bottom: '20px' },
        { left: '675px', bottom: '20px' },
        { left: '800px', bottom: '20px'},
    ];

    return (
        <div>
            <GameHeader
                isGameComplete={isGameComplete}
                onRestart={handleRestart}
                toggleHardMode={toggleHardMode}
                isHardMode={isHardMode}
            />
            <div className="game-controls">
                <button onClick={undoLastMove} disabled={!canUndo || isMoving}>Undo Last Move</button>
            </div>
            <div className="game-area">
                {containers.map((container, index) => (
                    <Container
                        key={container.id}
                        ref={el => containerRefs.current[index] = el}
                        container={container}
                        isCompleted={completedContainers.includes(container.id)}
                        selectedBoxes={selectedBoxes}
                        onClick={() => !isMoving && handleContainerClick(container.id)}
                        style={containerPositions[index]}
                        animatingBoxes={animatingBoxes.filter(ab => ab.sourceContainerId === container.id || ab.targetContainerId === container.id)}
                        isSliding={false}
                        allContainers={containers}
                    />
                ))}
            </div>
        </div>
    );
};

export default GameAlt;