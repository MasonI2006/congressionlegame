import { NextResponse } from 'next/server';
import { roster, getPuzzleForMember } from '../../../lib/data';

// Deterministic pseudo-random function based on seed
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10); // e.g., '2024-06-30'
  // Convert date to a number seed (e.g., 20240630)
  const seed = parseInt(today.split('-').join(''), 10);
  const random = seededRandom(seed);
  const index = Math.floor(random * roster.length);
  const member = roster[index];
  const puzzle = getPuzzleForMember(member);
  
  console.log('Puzzle API called for date:', today, 'Selected member:', member.fullName, 'Index:', index);
  
  // Add cache control headers to prevent caching
  return NextResponse.json(puzzle, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
} 