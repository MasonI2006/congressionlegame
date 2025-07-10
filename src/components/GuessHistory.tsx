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

function getStateFeedback(guessedState: string | undefined, actualState: string | undefined) {
  if (!guessedState || !actualState) return { arrow: '❓', percent: '--' };
  const g = stateCoords[guessedState];
  const a = stateCoords[actualState];
  if (!g || !a) return { arrow: '❓', percent: '--' };
  const dx = a.x - g.x;
  const dy = a.y - g.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const percent = Math.max(0, 100 - Math.round((dist / 1.414) * 100));
  const threshold = 0.02;
  let arrow = '⬆️';
  if (percent === 100) arrow = '✅';
  else if (Math.abs(dx) < threshold && dy > threshold) arrow = '⬆️';
  else if (Math.abs(dx) < threshold && dy < -threshold) arrow = '⬇️';
  else if (dx > threshold && Math.abs(dy) < threshold) arrow = '➡️';
  else if (dx < -threshold && Math.abs(dy) < threshold) arrow = '⬅️';
  else if (dx > threshold && dy > threshold) arrow = '↗️';
  else if (dx > threshold && dy < -threshold) arrow = '↘️';
  else if (dx < -threshold && dy > threshold) arrow = '↖️';
  else if (dx < -threshold && dy < -threshold) arrow = '↙️';
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

  const formatGuess = (guess: Guess) => {
    if (guess.party && guess.state) {
      return `${guess.guess} (${guess.party}-${guess.state})`;
    }
    return guess.guess;
  };

  return (
    <div className="guess-history card centered w-full max-w-[1400px] p-4 md:p-16">
      <h3 className="title text-2xl md:text-[2.2em] mb-4 md:mb-8">Guess History</h3>
      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[90px_2.5fr_1fr_1fr_1fr_1fr] items-right mb-3 font-semibold text-gray-400 gap-5">
          <div style={{ visibility: 'hidden' }}>#</div>
          <div>Name</div>
          <div className="text-center">State</div>
          <div className="text-center">Party</div>
          <div className="text-center">Chamber</div>
          <div className="text-center">State Proximity</div>
        </div>
        {guesses.map((guess, index) => {
          const feedback = getStateFeedback(guess.state, (guess as any).actualState);
          return (
            <div key={index} className="grid grid-cols-[20px_2.5fr_1fr_1fr_1fr_1fr] items-center mb-6 gap-4 min-h-16">
              <div className="text-center">{index + 1}</div>
              <div className="whitespace-normal overflow-wrap-anywhere pr-6">{formatGuess(guess)}</div>
              <div className="text-center">
                <span className={`feedback-bar ${guess.sameState ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-12 min-h-12 text-[1.2em] leading-12 rounded-xl`}>{guess.sameState ? '✓' : '✗'}</span>
              </div>
              <div className="text-center">
                <span className={`feedback-bar ${guess.sameParty ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-12 min-h-12 text-[1.2em] leading-12 rounded-xl`}>{guess.sameParty ? '✓' : '✗'}</span>
              </div>
              <div className="text-center">
                <span className={`feedback-bar ${guess.sameChamber ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-12 min-h-12 text-[1.2em] leading-12 rounded-xl`}>{guess.sameChamber ? '✓' : '✗'}</span>
              </div>
              <div className="text-center text-[1.2em]">
                <span className="feedback-arrow">{feedback.arrow} {feedback.percent}</span>
              </div>
            </div>
          );
        })}
        {/* Empty slots for remaining guesses */}
        {Array.from({ length: 5 - guesses.length }, (_, index) => (
          <div key={`empty-${index}`} className="grid grid-cols-[20px_2.5fr_1fr_1fr_1fr_1fr] items-center mb-6 gap-4 min-h-16 opacity-30">
            <div className="text-center">{guesses.length + index + 1}</div>
            <div>&nbsp;</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ))}
      </div>
      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col gap-4">
        {guesses.map((guess, index) => {
          const feedback = getStateFeedback(guess.state, (guess as any).actualState);
          return (
            <div key={index} className="bg-zinc-800 rounded-xl p-3 flex flex-col gap-1 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-base text-gray-400">Guess {index + 1}</span>
                <span className="text-xs text-gray-400">{feedback.arrow} {feedback.percent}</span>
              </div>
              <div className="text-sm"><span className="font-semibold text-gray-400">Name:</span> {formatGuess(guess)}</div>
              <div className="text-sm flex flex-wrap gap-2 mt-1">
                <span><span className="font-semibold text-gray-400">State:</span> <span className={`feedback-bar ${guess.sameState ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-7 min-h-7 text-base leading-7 rounded-lg align-middle mr-1`}>{guess.sameState ? '✓' : '✗'}</span></span>
                <span><span className="font-semibold text-gray-400">Party:</span> <span className={`feedback-bar ${guess.sameParty ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-7 min-h-7 text-base leading-7 rounded-lg align-middle mr-1`}>{guess.sameParty ? '✓' : '✗'}</span></span>
                <span><span className="font-semibold text-gray-400">Chamber:</span> <span className={`feedback-bar ${guess.sameChamber ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-7 min-h-7 text-base leading-7 rounded-lg align-middle mr-1`}>{guess.sameChamber ? '✓' : '✗'}</span></span>
              </div>
            </div>
          );
        })}
        {/* Empty slots for remaining guesses */}
        {Array.from({ length: 5 - guesses.length }, (_, index) => (
          <div key={`empty-mobile-${index}`} className="bg-zinc-800 rounded-xl p-3 flex flex-col gap-1 shadow-md opacity-30">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-base text-gray-400">Guess {guesses.length + index + 1}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="legend text-xs md:text-[0.7em] mt-6 md:mt-8 flex gap-4">
        <span><span className="legend-dot legend-correct"></span>Correct</span>
        <span><span className="legend-dot legend-wrong"></span>Wrong</span>
      </div>
    </div>
  );
} 