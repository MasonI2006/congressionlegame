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
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-400 font-semibold text-lg">
              <th className="px-2">#</th>
              <th className="px-2">Name</th>
              <th className="px-2 text-center">State</th>
              <th className="px-2 text-center">Party</th>
              <th className="px-2 text-center">Chamber</th>
              <th className="px-2 text-center">State Proximity</th>
            </tr>
          </thead>
          <tbody>
            {guesses.map((guess, index) => {
              const feedback = getStateFeedback(guess.state, (guess as any).actualState);
              return (
                <tr key={index} className="align-middle">
                  <td className="px-2 text-center font-bold">{index + 1}</td>
                  <td className="px-2 whitespace-normal break-words">{formatGuess(guess)}</td>
                  <td className="px-2 text-center">
                    <span className={`feedback-bar ${guess.sameState ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-10 min-h-10 text-lg leading-10 rounded-lg`}>{guess.sameState ? '✓' : '✗'}</span>
                  </td>
                  <td className="px-2 text-center">
                    <span className={`feedback-bar ${guess.sameParty ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-10 min-h-10 text-lg leading-10 rounded-lg`}>{guess.sameParty ? '✓' : '✗'}</span>
                  </td>
                  <td className="px-2 text-center">
                    <span className={`feedback-bar ${guess.sameChamber ? 'feedback-correct' : 'feedback-wrong'} inline-block min-w-10 min-h-10 text-lg leading-10 rounded-lg`}>{guess.sameChamber ? '✓' : '✗'}</span>
                  </td>
                  <td className="px-2 text-center text-lg">
                    <span className="feedback-arrow">{feedback.arrow} {feedback.percent}</span>
                  </td>
                </tr>
              );
            })}
            {/* Empty slots for remaining guesses */}
            {Array.from({ length: 5 - guesses.length }, (_, index) => (
              <tr key={`empty-${index}`} className="opacity-30 align-middle">
                <td className="px-2 text-center font-bold">{guesses.length + index + 1}</td>
                <td className="px-2">&nbsp;</td>
                <td className="px-2"></td>
                <td className="px-2"></td>
                <td className="px-2"></td>
                <td className="px-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend text-xs md:text-[0.7em] mt-6 md:mt-8 flex gap-4">
        <span><span className="legend-dot legend-correct"></span>Correct</span>
        <span><span className="legend-dot legend-wrong"></span>Wrong</span>
      </div>
    </div>
  );
} 