'use client';
import React from 'react';
import stateCoords from '../lib/state_center_coords.json';

export type Guess = {
  guess: string;
  correct: boolean;
  sameState: boolean;
  sameParty: boolean;
  chamber: 'House' | 'Senate';
  sameChamber: boolean;
  party?: string;
  state?: string;
};

// Helper to compute distance and direction
function getStateFeedback(guessedState: string | undefined, actualState: string | undefined) {
  if (!guessedState || !actualState) return { arrow: '❓', percent: '--' };
  const g = stateCoords[guessedState];
  const a = stateCoords[actualState];
  if (!g || !a) return { arrow: '❓', percent: '--' };
  const dx = a.x - g.x;
  const dy = a.y - g.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Max possible distance is sqrt(1^2 + 1^2) = ~1.414
  const percent = Math.max(0, 100 - Math.round((dist / 1.414) * 100));
  // Direction
  const threshold = 0.02;
  let arrow = '⬆️';
  if (percent === 100) arrow = '✅';
  else if (Math.abs(dx) < threshold && dy > threshold) arrow = '⬆️'; // north
  else if (Math.abs(dx) < threshold && dy < -threshold) arrow = '⬇️'; // south
  else if (dx > threshold && Math.abs(dy) < threshold) arrow = '➡️'; // east
  else if (dx < -threshold && Math.abs(dy) < threshold) arrow = '⬅️'; // west
  else if (dx > threshold && dy > threshold) arrow = '↗️'; // northeast
  else if (dx > threshold && dy < -threshold) arrow = '↘️'; // southeast
  else if (dx < -threshold && dy > threshold) arrow = '↖️'; // northwest
  else if (dx < -threshold && dy < -threshold) arrow = '↙️'; // southwest
  return { arrow, percent: `${percent}%` };
}

export default function GuessHistory({ guesses }: { guesses: Guess[] }) {
  if (guesses.length === 0) {
    return (
      <div className="guess-history centered" style={{ fontSize: '2em', padding: '4em' }}>
        <p className="instructions">No guesses yet. Start by typing a member of congress' name above!</p>
      </div>
    );
  }

  // Helper to format guess display
  const formatGuess = (guess: Guess) => {
    // Try to extract party and state from the guess string if present
    // (Assumes guess string is just the name, so fallback to just name)
    // In a real app, you would want to pass the full member object or look it up
    // For now, just show the name
    if (guess.party && guess.state) {
      return `${guess.guess} (${guess.party}-${guess.state})`;
    }
    return guess.guess;
  };

  return (
    <div className="guess-history card centered text-2xl md:text-2xl text-lg p-16 md:p-16 p-10 min-w-[900px] md:min-w-[900px] min-w-auto max-w-[1400px] md:max-w-[1400px] max-w-full">
      <h3 className="title text-[2.2em] md:text-[2.2em] text-[1.32em] mb-5 md:mb-5 mb-3">Guess History</h3>
      <div className="grid grid-cols-[90px_2.5fr_1fr_1fr_1fr_1fr] md:grid-cols-[90px_2.5fr_1fr_1fr_1fr_1fr] grid-cols-[54px_1.5fr_0.6fr_0.6fr_0.6fr_0.6fr] items-right mb-3 md:mb-3 mb-2 font-semibold text-gray-400 gap-5 md:gap-5 gap-3">
        <div style={{ visibility: 'hidden' }}>#</div>
        <div>Name</div>
        <div className="text-center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;State</div>
        <div className="text-center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Party</div>
        <div className="text-center">&nbsp;&nbsp;&nbsp;&nbsp;Chamber</div>
        <div className="text-center">State Proximity</div>
      </div>
      {guesses.map((guess, index) => {
        const feedback = getStateFeedback(guess.state, (guess as any).actualState);
        return (
          <div key={index} className="grid grid-cols-[20px_2.5fr_1fr_1fr_1fr_1fr] md:grid-cols-[20px_2.5fr_1fr_1fr_1fr_1fr] grid-cols-[12px_1.5fr_0.6fr_0.6fr_0.6fr_0.6fr] items-center mb-6 md:mb-6 mb-4 gap-4 md:gap-4 gap-3 min-h-16 md:min-h-16 min-h-10">
            <div className="text-center">{index + 1}</div>
            <div className="whitespace-normal overflow-wrap-anywhere pr-6 md:pr-6 pr-4">{formatGuess(guess)}</div>
            <div className="text-center">
              <span className={`feedback-bar ${guess.sameState ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-12 md:min-w-12 min-w-7 min-h-12 md:min-h-12 min-h-7 text-[1.2em] md:text-[1.2em] text-[0.72em] leading-12 md:leading-12 leading-7 rounded-xl md:rounded-xl rounded-lg`}>{guess.sameState ? '✓' : '✗'}</span>
            </div>
            <div className="text-center">
              <span className={`feedback-bar ${guess.sameParty ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-12 md:min-w-12 min-w-7 min-h-12 md:min-h-12 min-h-7 text-[1.2em] md:text-[1.2em] text-[0.72em] leading-12 md:leading-12 leading-7 rounded-xl md:rounded-xl rounded-lg`}>{guess.sameParty ? '✓' : '✗'}</span>
            </div>
            <div className="text-center">
              <span className={`feedback-bar ${guess.sameChamber ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-12 md:min-w-12 min-w-7 min-h-12 md:min-h-12 min-h-7 text-[1.2em] md:text-[1.2em] text-[0.72em] leading-12 md:leading-12 leading-7 rounded-xl md:rounded-xl rounded-lg`}>{guess.sameChamber ? '✓' : '✗'}</span>
            </div>
            <div className="text-center text-[1.2em] md:text-[1.2em] text-[0.72em]">
              <span className="feedback-arrow">{feedback.arrow} {feedback.percent}</span>
            </div>
          </div>
        );
      })}
      {/* Empty slots for remaining guesses */}
      {Array.from({ length: 5 - guesses.length }, (_, index) => (
        <div key={`empty-${index}`} className="grid grid-cols-[20px_2.5fr_1fr_1fr_1fr_1fr] md:grid-cols-[20px_2.5fr_1fr_1fr_1fr_1fr] grid-cols-[12px_1.5fr_0.6fr_0.6fr_0.6fr_0.6fr] items-center mb-6 md:mb-6 mb-4 gap-4 md:gap-4 gap-3 min-h-16 md:min-h-16 min-h-10 opacity-30">
          <div className="text-center">{guesses.length + index + 1}</div>
          <div>&nbsp;</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ))}
      <div className="legend text-[0.7em] md:text-[0.7em] text-[0.42em] mt-8 md:mt-8 mt-5">
        <span><span className="legend-dot legend-correct"></span>Correct</span>
        <span><span className="legend-dot legend-wrong"></span>Wrong</span>
      </div>
    </div>
  );
} 