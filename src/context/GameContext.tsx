import React, { createContext, useReducer, useEffect, useState } from 'react';
import type { Puzzle } from '../lib/data';

export type Guess = {
  guess: string;
  correct: boolean;
  sameState: boolean;
  sameParty: boolean;
  chamber: 'House' | 'Senate';
  sameChamber: boolean;
  party?: string;
  state?: string;
  actualState?: string;
};

interface GameState {
  puzzle: Puzzle | null;
  guesses: Guess[];
  solved: boolean;
}

const initialState: GameState = {
  puzzle: null,
  guesses: [],
  solved: false,
};

type Action =
  | { type: 'INIT'; payload: Puzzle }
  | { type: 'GUESS'; payload: Guess }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT':
      return { puzzle: action.payload, guesses: [], solved: false };
    case 'GUESS':
      const solved = action.payload.correct || state.guesses.length + 1 >= 5;
      return {
        ...state,
        guesses: [...state.guesses, action.payload],
        solved,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

function GameProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // 24-hour timer constants
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Helper function to check if 24 hours have passed
  const shouldResetPuzzle = () => {
    const lastPuzzleTime = localStorage.getItem('congressionle-puzzle-timestamp');
    if (!lastPuzzleTime) return true;
    
    const now = Date.now();
    const timeDiff = now - parseInt(lastPuzzleTime, 10);
    return timeDiff >= TWENTY_FOUR_HOURS;
  };

  // Helper function to set the current timestamp
  const setPuzzleTimestamp = () => {
    localStorage.setItem('congressionle-puzzle-timestamp', Date.now().toString());
  };

  // Ensure we're on the client before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Check if we need to reset the puzzle (24 hours have passed)
    if (shouldResetPuzzle()) {
      console.log('24 hours have passed, clearing saved state and resetting timer');
      localStorage.removeItem('gtr-state');
      localStorage.removeItem('congressionle-last-date');
      setPuzzleTimestamp();
      return; // Don't restore old state, let the Game component fetch new puzzle
    }
    
    // Only restore saved state if less than 24 hours have passed
    const saved = localStorage.getItem('gtr-state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        console.log('Restoring saved state (within 24 hours)');
        dispatch({ type: 'INIT', payload: parsedState.puzzle });
        // Restore guesses and solved state
        if (parsedState.guesses) {
          parsedState.guesses.forEach((guess: Guess) => {
            dispatch({ type: 'GUESS', payload: guess });
          });
        }
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('gtr-state', JSON.stringify(state));
    }
  }, [state, isClient]);

  // Set up 24-hour timer that checks every minute for reset
  useEffect(() => {
    if (!isClient) return;

    const checkTimer = () => {
      if (shouldResetPuzzle()) {
        console.log('24-hour timer expired, forcing puzzle reset');
        localStorage.removeItem('gtr-state');
        localStorage.removeItem('congressionle-last-date');
        setPuzzleTimestamp();
        window.location.reload(); // Force refresh to get new puzzle
      }
    };

    // Check every minute (60 seconds)
    const interval = setInterval(checkTimer, 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isClient]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export { GameContext, GameProvider }; 