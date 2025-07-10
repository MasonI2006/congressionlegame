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
    <div className="guess-history card centered" style={{ fontSize: '2em', padding: '4em', minWidth: 900, maxWidth: 1400 }}>
      <h3 className="title" style={{ fontSize: '2.2em', marginBottom: '1.2em' }}>Guess History</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 2.5fr 1fr 1fr 1fr 1fr', alignItems: 'right', marginBottom: 12, fontWeight: 600, color: '#a1a1aa', gap: '20px' }}>
        <div style={{ visibility: 'hidden' }}>#</div>
        <div>Name</div>
        <div style={{ textAlign: 'center' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;State</div>
        <div style={{ textAlign: 'center' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Party</div>
        <div style={{ textAlign: 'center' }}>&nbsp;&nbsp;&nbsp;&nbsp;Chamber</div>
        <div style={{ textAlign: 'center' }}>State Proximity</div>
      </div>
      {guesses.map((guess, index) => {
        const feedback = getStateFeedback(guess.state, (guess as any).actualState);
        return (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '20px 2.5fr 1fr 1fr 1fr 1fr', alignItems: 'center', marginBottom: 24, gap: '16px', minHeight: 64 }}>
            <div style={{ textAlign: 'center' }}>{index + 1}</div>
            <div style={{ whiteSpace: 'normal', overflowWrap: 'anywhere', paddingRight: 24 }}>{formatGuess(guess)}</div>
            <div style={{ textAlign: 'center' }}>
              <span className={`feedback-bar ${guess.sameState ? 'feedback-correct' : 'feedback-wrong'}`} style={{ display: 'inline-block', minWidth: 48, minHeight: 48, fontSize: '1.2em', lineHeight: '48px', borderRadius: 12 }}>{guess.sameState ? '✓' : '✗'}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span className={`feedback-bar ${guess.sameParty ? 'feedback-correct' : 'feedback-wrong'}`} style={{ display: 'inline-block', minWidth: 48, minHeight: 48, fontSize: '1.2em', lineHeight: '48px', borderRadius: 12 }}>{guess.sameParty ? '✓' : '✗'}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span className={`feedback-bar ${guess.sameChamber ? 'feedback-correct' : 'feedback-wrong'}`} style={{ display: 'inline-block', minWidth: 48, minHeight: 48, fontSize: '1.2em', lineHeight: '48px', borderRadius: 12 }}>{guess.sameChamber ? '✓' : '✗'}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
              <span className="feedback-arrow">{feedback.arrow} {feedback.percent}</span>
            </div>
          </div>
        );
      })}
      {/* Empty slots for remaining guesses */}
      {Array.from({ length: 5 - guesses.length }, (_, index) => (
        <div key={`empty-${index}`} style={{ display: 'grid', gridTemplateColumns: '20px 2.5fr 1fr 1fr 1fr 1fr', alignItems: 'center', marginBottom: 24, gap: '16px', minHeight: 64, opacity: 0.3 }}>
          <div style={{ textAlign: 'center' }}>{guesses.length + index + 1}</div>
          <div>&nbsp;</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ))}
      <div className="legend" style={{ fontSize: '0.7em', marginTop: 32 }}>
        <span><span className="legend-dot legend-correct"></span>Correct</span>
        <span><span className="legend-dot legend-wrong"></span>Wrong</span>
      </div>
    </div>
  );
} 