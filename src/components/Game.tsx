'use client';
import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import PieChartFinance from './PieChartFinance';
import PieChartTopContributors from './PieChartTopContributors';
import PieChartTopIndustries from './PieChartTopIndustries';
import StockCard from './StockCard';
import ElectionCard from './ElectionCard';
import GuessInput from './GuessInput';
import GuessHistory from './GuessHistory';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function Game() {
  const { state, dispatch } = useContext(GameContext);
  const [isLoading, setIsLoading] = useState(true);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastConfettiGuess, setLastConfettiGuess] = useState(-1);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch today's puzzle
    fetch('/api/puzzle')
      .then(res => res.json())
      .then(data => {
        dispatch({ type: 'INIT', payload: data });
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  // Refresh puzzle daily
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('congressionle-last-date');
    
    // Force refresh if no last date or if dates don't match
    if (!lastDate || lastDate !== today) {
      localStorage.setItem('congressionle-last-date', today);
      localStorage.removeItem('gtr-state'); // Clear guesses and solved state
      window.location.reload();
    } else {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (
      mounted &&
      state.guesses.length > 0
    ) {
      const lastIndex = state.guesses.length - 1;
      if (state.guesses[lastIndex].correct && lastConfettiGuess !== lastIndex) {
        setShowConfetti(true);
        setLastConfettiGuess(lastIndex);
        const timeout = setTimeout(() => setShowConfetti(false), 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [state.guesses, lastConfettiGuess, mounted]);

  // Show loading state until data is fetched
  if (!ready) return null;

  return (
    <>
      {/* Confetti for any correct guess */}
      {showConfetti && width > 0 && height > 0 && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={1200}
          gravity={0.2}
          colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ffa500', '#a3e635', '#ef4444']}
          recycle={false}
          style={{ zIndex: 9999, pointerEvents: 'none', position: 'fixed', top: 0, left: 0 }}
        />
      )}
      <div className="centered">
        {state.puzzle && (
          <>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 0, justifyContent: 'center', marginBottom: 24 }}>
              <PieChartFinance data={state.puzzle.financeMix} />
              <div style={{ marginLeft: -32 }}>
                <PieChartTopContributors data={state.puzzle.topContributors} />
              </div>
              <div style={{ marginLeft: -32 }}>
                <PieChartTopIndustries data={state.puzzle.topIndustries} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center', marginBottom: 24 }}>
              <StockCard value={state.puzzle.stockValueUSD} tradesCount={state.puzzle.tradesCount} />
              <ElectionCard firstElection={state.puzzle.answer.firstElection} nextElection={state.puzzle.answer.nextElection} />
              {Array.isArray(state.puzzle.committees) && state.puzzle.committees.length > 0 && (
                <div className="card centered" style={{ minWidth: 240, maxWidth: 240 }}>
                  <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8 }}>Committees</h3>
                  <ul style={{ listStyle: 'disc', paddingLeft: 24, textAlign: 'left' }}>
                    {state.puzzle.committees.map((committee: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{committee}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
        <div className="card centered" style={{ width: '100%', maxWidth: '100%' }}>
          <h2 className="title" style={{ fontSize: '1.2em', marginBottom: 8 }}>Make Your Guess</h2>
          <div className="subtitle" style={{ marginBottom: 16 }}>
            {state.solved
              ? "Game complete! Here's the answer:"
              : state.guesses.length >= 5
                ? "Out of guesses! Here's the answer:"
                : `You have ${5 - state.guesses.length} guesses remaining`}
          </div>
          <GuessInput disabled={state.solved || state.guesses.length >= 5} />
          <GuessHistory guesses={state.guesses} />
        </div>
        <div className="card centered" style={{ width: '100%', maxWidth: 500, margin: '24px auto 0 auto', fontSize: '1.2em' }}>
          <a href="https://masonistre.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#a3e635', fontWeight: 700, textDecoration: 'none', fontSize: '1.2em' }}>
            Visit my website: masonistre.dev
          </a>
        </div>
        {(state.solved || state.guesses.length >= 5) && state.puzzle && state.puzzle.answer && (
          <div className="card centered" style={{ border: '2px solid #22c55e', marginTop: 24 }}>
            <div style={{ fontSize: '2em', fontWeight: 700, color: '#a3e635', marginBottom: 8 }}>
              {state.puzzle.answer.fullName}
            </div>
            <div style={{ color: '#a1a1aa', fontSize: '1.1em', marginBottom: 8 }}>
              {state.puzzle.answer.state} &middot; {state.puzzle.answer.party === 'D' ? 'Democrat' : state.puzzle.answer.party === 'R' ? 'Republican' : 'Independent'}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 