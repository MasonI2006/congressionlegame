'use client';
import React from 'react';
import Game from '../components/Game';

export default function HomePage() {
  return (
    <div className="centered" style={{ minHeight: '100vh', width: '100vw' }}>
      <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '2em 1em' }}>
        <h1 className="title">Guess the Member of Congress</h1>
        <div className="subtitle">Use campaign finance data to identify the mystery member of congress</div>
        <Game />
      </div>
    </div>
  );
} 