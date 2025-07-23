'use client';
import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { roster, getPuzzleForMember } from '../lib/data';
import PieChartFinance from './PieChartFinance';
import PieChartTopContributors from './PieChartTopContributors';
import PieChartTopIndustries from './PieChartTopIndustries';
import StockCard from './StockCard';
import CommitteeCard from './CommitteeCard';
import CorporatePACCard from './CorporatePACCard';
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
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [isNarrowAspectRatio, setIsNarrowAspectRatio] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for narrow aspect ratio
  useEffect(() => {
    const checkAspectRatio = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      setIsNarrowAspectRatio(aspectRatio < 1.2); // Consider narrow if width/height < 1.2
    };

    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);
    return () => window.removeEventListener('resize', checkAspectRatio);
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const updateCountdown = () => {
      const timestamp = localStorage.getItem('congressionle-puzzle-timestamp');
      if (timestamp) {
        const SIXTY_SECONDS = 60 * 1000; // 60 seconds in milliseconds
        const puzzleTime = parseInt(timestamp, 10);
        const currentPeriod = Math.floor(puzzleTime / SIXTY_SECONDS);
        const nextPeriodTime = (currentPeriod + 1) * SIXTY_SECONDS;
        const now = Date.now();
        const timeLeft = nextPeriodTime - now;
        
        if (timeLeft > 0) {
          const seconds = Math.floor(timeLeft / 1000);
          setTimeUntilNext(`${seconds.toString().padStart(2, '0')}s`);
        } else {
          setTimeUntilNext('00s');
          // Trigger new puzzle fetch when time runs out
          if (state.puzzle) {
            fetchNewPuzzle();
          }
        }
      }
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [state.puzzle]);

  // Function to get current puzzle based on 60-second periods
  const getCurrentPuzzle = () => {
    const now = Date.now();
    const SIXTY_SECONDS = 60 * 1000;
    const periodNumber = Math.floor(now / SIXTY_SECONDS);
    
    // Deterministic selection based on period
    const seed = periodNumber * 9301 + 49297; // Simple LCG
    const random = (seed % 233280) / 233280;
    const index = Math.floor(random * roster.length);
    
    return roster[index];
  };

  // Function to fetch a new puzzle
  const fetchNewPuzzle = () => {
    const member = getCurrentPuzzle();
    const puzzle = getPuzzleForMember(member);
    
    dispatch({ type: 'RESET' });
    dispatch({ type: 'INIT', payload: puzzle });
    localStorage.setItem('congressionle-puzzle-timestamp', Date.now().toString());
    console.log('Fetched new puzzle for new 60-second period:', member.fullName);
  };

  useEffect(() => {
    // Only fetch puzzle if we don't already have one (from GameContext restoration)
    if (!state.puzzle) {
      // Get current puzzle based on client-side calculation
      const member = getCurrentPuzzle();
      const puzzle = getPuzzleForMember(member);
      
      dispatch({ type: 'INIT', payload: puzzle });
      
      // Only set timestamp when fetching a completely new puzzle
      const existingTimestamp = localStorage.getItem('congressionle-puzzle-timestamp');
      if (!existingTimestamp) {
        localStorage.setItem('congressionle-puzzle-timestamp', Date.now().toString());
      }
      setIsLoading(false);
      setReady(true);
      console.log('Loaded puzzle for:', member.fullName);
    } else {
      // If we already have a puzzle (restored from localStorage), just mark as ready
      setIsLoading(false);
      setReady(true);
    }
  }, [dispatch, state.puzzle]);

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
              <PieChartFinance data={state.puzzle.financeMix} totalRaised={state.puzzle.amountRaised} />
              <div style={{ marginLeft: -32 }}>
                <PieChartTopContributors data={state.puzzle.topContributors} />
              </div>
              <div style={{ marginLeft: -32 }}>
                <PieChartTopIndustries data={state.puzzle.topIndustries} />
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: isNarrowAspectRatio ? 'column' : 'row', 
              gap: 12, 
              justifyContent: 'center', 
              alignItems: isNarrowAspectRatio ? 'center' : 'flex-start',
              marginBottom: 24, 
              flexWrap: 'nowrap',
              overflowX: isNarrowAspectRatio ? 'visible' : 'auto'
            }}>
              <div style={{ flex: '0 0 auto', minWidth: 280, maxWidth: 320 }}>
                <StockCard 
                  value={state.puzzle.stockValueUSD} 
                  tradesCount={state.puzzle.tradesCount}
                  tickerHoldingCount={state.puzzle.tickerHoldingCount}
                  currentNetWorth={state.puzzle.currentNetWorth}
                />
              </div>
              <div style={{ flex: '0 0 auto', minWidth: 280, maxWidth: 320 }}>
                <CorporatePACCard 
                  corporatePACMoney={state.puzzle.corporatePACMoney}
                  maxDonors={state.puzzle.maxDonors}
                  uniqueDonors={state.puzzle.uniqueDonors}
                />
              </div>
              <div style={{ flex: '0 0 auto', minWidth: 280, maxWidth: 320 }}>
                <CommitteeCard committees={state.puzzle.committees} />
              </div>
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
        {timeUntilNext && (
          <div className="card centered" style={{ width: '100%', maxWidth: 500, margin: '16px auto 0 auto', fontSize: '1.1em' }}>
            <div style={{ color: '#a1a1aa', marginBottom: 4 }}>New member in:</div>
            <div style={{ fontSize: '1.3em', fontWeight: 700, color: '#22d3ee' }}>
              {timeUntilNext}
            </div>
          </div>
        )}
        {(state.solved || state.guesses.length >= 5) && state.puzzle && state.puzzle.answer && (
          <div className="card centered" style={{ border: '2px solid #22c55e', marginTop: 24 }}>
            <div style={{ fontSize: '2em', fontWeight: 700, color: '#a3e635', marginBottom: 8 }}>
              {state.puzzle.answer.fullName}
            </div>
            <div style={{ color: '#a1a1aa', fontSize: '1.1em', marginBottom: 12 }}>
              {state.puzzle.answer.state} &middot; {state.puzzle.answer.party === 'D' ? 'Democrat' : state.puzzle.answer.party === 'R' ? 'Republican' : 'Independent'}
            </div>
            {state.puzzle.answer.photoUrl && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {state.puzzle.answer.websiteUrl ? (
                  <a 
                    href={state.puzzle.answer.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <img 
                      src={state.puzzle.answer.photoUrl} 
                      alt={`Photo of ${state.puzzle.answer.fullName}`}
                      style={{ 
                        width: 120, 
                        height: 150, 
                        objectFit: 'cover', 
                        borderRadius: 8, 
                        border: '2px solid #374151',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = '#22d3ee'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#374151'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </a>
                ) : (
                  <img 
                    src={state.puzzle.answer.photoUrl} 
                    alt={`Photo of ${state.puzzle.answer.fullName}`}
                    style={{ 
                      width: 120, 
                      height: 150, 
                      objectFit: 'cover', 
                      borderRadius: 8, 
                      border: '2px solid #374151'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                {state.puzzle.answer.websiteUrl && (
                  <div style={{ marginTop: 8, fontSize: '0.9em', color: '#a1a1aa' }}>
                    Click photo to visit official website
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="card centered" style={{ width: '100%', maxWidth: 500, margin: '24px auto 0 auto', fontSize: '0.9em', color: '#a1a1aa' }}>
          <div style={{ textAlign: 'center' }}>
            <span>Campaign finance data was sourced from </span>
            <a href="https://www.opensecrets.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#a3e635', fontWeight: 600, textDecoration: 'none' }}>
              OpenSecrets
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span>Stock and Corporate PAC data was sourced from </span>
            <a href="https://www.quiverquant.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#a3e635', fontWeight: 600, textDecoration: 'none' }}>
              Quiver Quantitative
            </a>
          </div>
        </div>
      </div>
    </>
  );
} 