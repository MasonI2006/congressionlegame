'use client';
import React from 'react';
import './globals.css';
import { GameProvider } from '../context/GameContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen font-sans">
        <GameProvider>
          <header style={{ width: '100%', textAlign: 'center', margin: '32px 0 24px 0' }}>
            <h1 className="animated-underline" style={{ fontSize: '10em', fontWeight: 900, letterSpacing: '0.08em', color: 'white', textShadow: '0 2px 16px #0008' }}>
              CONGRESSION<span style={{ color: 'red' }}>L</span>E
            </h1>
          </header>
          {children}
        </GameProvider>
      </body>
    </html>
  );
} 