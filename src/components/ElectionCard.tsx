'use client';
import React from 'react';

export default function ElectionCard({ firstElection, nextElection }: { firstElection: number; nextElection: number | string }) {
  return (
    <div className="card centered" style={{ minWidth: 240, marginRight: 16 }}>
      <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8 }}>Elections</h3>
      <div style={{ fontSize: '1.1em', marginBottom: 4 }}>
        <span style={{ color: '#a3e635', fontWeight: 700 }}>First:</span> {firstElection}
      </div>
      <div style={{ fontSize: '1.1em' }}>
        <span style={{ color: '#a3e635', fontWeight: 700 }}>Next:</span> {typeof nextElection === 'string' ? nextElection : nextElection}
      </div>
    </div>
  );
} 