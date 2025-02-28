import React from 'react';
import {GameHeaderProps} from "../types/types";

const GameHeader: React.FC<GameHeaderProps> = ({ isGameComplete, onRestart, isHardMode, toggleHardMode }) => {
    return (
        <div className="game-header">
            {!isGameComplete ? (
                <div>
                    <h1>Color Sort Challenge</h1>
                    <button onClick={toggleHardMode} style={{marginBottom: '20px'}}>
                        {isHardMode ? 'Switch to Normal Mode' : 'Switch to Hard Mode'}
                    </button>
                </div>
            ) : (
                <div>
                    <h1>Congratulations!</h1>
                    <p>You've sorted all the colors!</p>
                    <button onClick={onRestart}>Play Again</button>
                </div>
            )}
        </div>
    );
};

export default GameHeader;