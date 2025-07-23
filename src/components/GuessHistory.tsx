'use client';
import React from 'react';
import { roster } from '../lib/data';

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
  actualMemberName?: string;
};

// Haversine formula to calculate distance between two lat/lng points in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  
  // Convert degrees to radians
  const lat1Rad = lat1 * (Math.PI / 180);
  const lon1Rad = lon1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const lon2Rad = lon2 * (Math.PI / 180);
  
  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

function getStateFeedback(guessedMemberName: string | undefined, actualMemberName: string | undefined) {
  if (!guessedMemberName || !actualMemberName) return { arrow: '❓', distance: '--' };
  
  const guessedMember = roster.find(m => m.fullName === guessedMemberName);
  const actualMember = roster.find(m => m.fullName === actualMemberName);
  
  if (!guessedMember || !actualMember) {
    console.log('Member not found:', { guessedMemberName, actualMemberName, rosterSize: roster.length });
    return { arrow: '❓', distance: '--' };
  }
  
  // Log coordinates for debugging
  console.log('Coordinates check:', {
    guessed: { name: guessedMember.fullName, lat: guessedMember.lat, lon: guessedMember.lon },
    actual: { name: actualMember.fullName, lat: actualMember.lat, lon: actualMember.lon }
  });
  
  // Special case: If the answer is a Senator, anyone from the same state gets 0 miles
  if (actualMember.chamber === 'Senate' && guessedMember.state === actualMember.state) {
    return { arrow: '✅', distance: '0 mi' };
  }
  
  // Special case: If the guess is a Senator and answer is from same state, also 0 miles
  if (guessedMember.chamber === 'Senate' && guessedMember.state === actualMember.state) {
    return { arrow: '✅', distance: '0 mi' };
  }
  
  const distance = calculateDistance(
    guessedMember.lat, 
    guessedMember.lon, 
    actualMember.lat, 
    actualMember.lon
  );
  
  // Validate the calculated distance
  if (isNaN(distance) || distance < 0) {
    return { arrow: '❓', distance: '--' };
  }
  
  // Calculate direction arrow based on lat/lng differences
  const dLat = actualMember.lat - guessedMember.lat;
  const dLon = actualMember.lon - guessedMember.lon;
  const threshold = 0.5; // degrees
  
  let arrow = '⬆️';
  if (distance === 0) arrow = '✅';
  else if (Math.abs(dLon) < threshold && dLat > threshold) arrow = '⬆️';
  else if (Math.abs(dLon) < threshold && dLat < -threshold) arrow = '⬇️';
  else if (dLon > threshold && Math.abs(dLat) < threshold) arrow = '➡️';
  else if (dLon < -threshold && Math.abs(dLat) < threshold) arrow = '⬅️';
  else if (dLon > threshold && dLat > threshold) arrow = '↗️';
  else if (dLon > threshold && dLat < -threshold) arrow = '↘️';
  else if (dLon < -threshold && dLat > threshold) arrow = '↖️';
  else if (dLon < -threshold && dLat < -threshold) arrow = '↙️';
  
  // Return distance in miles format
  return { arrow, distance: `${distance} mi` };
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
              <th className="px-2 text-center">Distance</th>
            </tr>
          </thead>
          <tbody>
            {guesses.map((guess, index) => {
              const feedback = getStateFeedback(guess.guess, (guess as any).actualMemberName);
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
                    <span className="feedback-arrow">{feedback.arrow} {feedback.distance}</span>
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