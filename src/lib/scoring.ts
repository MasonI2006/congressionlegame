import { Puzzle } from './data';

export function scoreGuess(guessName: string, puzzle: Puzzle) {
  const correct = guessName === puzzle.answer.fullName;
  // For demo, just compare fullName; in real app, use memberId
  const sameState = guessName && puzzle.answer && guessName.split(' ').pop() === puzzle.answer.state;
  // This is a placeholder; real logic should look up the roster
  const sameParty = false; // Placeholder
  return { correct, sameState, sameParty };
} 