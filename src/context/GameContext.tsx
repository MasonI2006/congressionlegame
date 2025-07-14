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

  // Helper function to get today's date string
  const getTodayString = () => {
    return new Date().toISOString().slice(0, 10);
  };

  // Ensure we're on the client before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Check if we need to refresh for a new day
    const today = getTodayString();
    const lastDate = localStorage.getItem('congressionle-last-date');
    
    // If it's a new day, clear the saved state
    if (!lastDate || lastDate !== today) {
      console.log('New day detected, clearing saved state:', { lastDate, today });
      localStorage.setItem('congressionle-last-date', today);
      localStorage.removeItem('gtr-state');
      return; // Don't restore old state, let the Game component fetch new puzzle
    }
    
    // Only restore saved state if it's the same day
    const saved = localStorage.getItem('gtr-state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        console.log('Restoring saved state for today:', today);
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

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export { GameContext, GameProvider }; 