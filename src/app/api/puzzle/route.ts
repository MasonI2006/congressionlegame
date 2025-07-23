import { NextResponse } from 'next/server';
import { roster, getPuzzleForMember } from '../../../lib/data';

// Deterministic pseudo-random function based on seed
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function GET() {
  // Use 12-hour periods instead of 60-second periods
  const now = Date.now();
  const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
  // Calculate which 12-hour period we're in since epoch
  const periodNumber = Math.floor(now / TWELVE_HOURS);
  
  // Use period number as seed for deterministic randomization
  const seed = periodNumber;
  const random = seededRandom(seed);
  const index = Math.floor(random * roster.length);
  const member = roster[index];
  const puzzle = getPuzzleForMember(member);
  
  console.log('Puzzle API called for 12-hour period:', periodNumber, 'Selected member:', member.fullName, 'Index:', index);
  
  // Add cache control headers to prevent caching
  return NextResponse.json(puzzle, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
} 