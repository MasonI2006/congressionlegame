'use client';
import React, { useState, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { roster } from '../lib/data';

export default function GuessInput({ disabled }: { disabled: boolean }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof roster>([]);
  const { state, dispatch } = useContext(GameContext);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.length > 0) {
      const searchTerm = value.toLowerCase();
      const filtered = roster.filter(member => {
        const fullName = member.fullName.toLowerCase();
        const state = member.state.toLowerCase();
        const party = (member.party === 'D' ? 'democrat' : member.party === 'R' ? 'republican' : 'independent').toLowerCase();
        
        return fullName.includes(searchTerm) || 
               state.includes(searchTerm) || 
               party.includes(searchTerm);
      });
      
      // Sort results: exact name matches first, then partial name matches, then state/party matches
      const sortedFiltered = filtered.sort((a, b) => {
        const aName = a.fullName.toLowerCase();
        const bName = b.fullName.toLowerCase();
        
        // Exact start of name match gets highest priority
        const aStartsWithName = aName.startsWith(searchTerm);
        const bStartsWithName = bName.startsWith(searchTerm);
        
        if (aStartsWithName && !bStartsWithName) return -1;
        if (!aStartsWithName && bStartsWithName) return 1;
        
        // Then alphabetical order
        return aName.localeCompare(bName);
      });
      
      // Show up to 20 suggestions instead of just 5
      setSuggestions(sortedFiltered.slice(0, 20));
    } else {
      setSuggestions([]);
    }
  };

  const handleGuess = (memberId: string) => {
    const member = roster.find(m => m.memberId === memberId);
    if (!member || !state.puzzle) return;

    const { puzzle } = state;
    const answerChamber = roster.find(m => m.fullName === puzzle.answer.fullName)?.chamber;
    const correct = memberId === puzzle.memberId;
    const sameState = member.state === puzzle.answer.state;
    const sameParty = member.party === puzzle.answer.party;
    const sameChamber = member.chamber === answerChamber;

    const guessPayload = { 
      guess: member.fullName, 
      correct, 
      sameState, 
      sameParty, 
      chamber: member.chamber as 'House' | 'Senate', 
      sameChamber, 
      party: member.party, 
      state: member.state, 
      actualState: puzzle.answer.state,
      actualMemberName: puzzle.answer.fullName
    };

    dispatch({
      type: 'GUESS',
      payload: guessPayload
    });

    setInput('');
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleGuess(suggestions[0].memberId);
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: '2em' }}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className=""
          placeholder="Type a name, state, or party..."
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
        />
      </form>
      {suggestions.length > 0 && !disabled && (
        <div className="suggestion-list">
          {suggestions.map((member) => (
            <button
              key={member.memberId}
              onClick={() => handleGuess(member.memberId)}
              className="guess-suggestion"
            >
              <div style={{ fontWeight: 500 }}>{member.fullName}</div>
              <div style={{ fontSize: '0.95em', color: '#a1a1aa' }}>{member.state} • {member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent'}</div>
            </button>
          ))}
        </div>
      )}
      <div className="instructions">
        After each guess, you'll see feedback on whether you got the correct member of congress, same state, and same party.
      </div>
    </div>
  );
} 