'use client';
import React from 'react';

export default function CommitteeCard({ committees }: { committees?: string[] }) {
  const hasCommittees = committees && committees.length > 0;

  return (
    <div className="card centered" style={{ minWidth: 300, padding: '24px' }}>
      <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 16 }}>
        Committee{hasCommittees && committees.length > 1 ? 's' : ''} 
        {hasCommittees && (
          <span style={{ color: '#a1a1aa', fontSize: '0.8em', marginLeft: 8 }}>
            ({committees.length})
          </span>
        )}
      </h3>
      {hasCommittees ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {committees.map((committee, index) => (
            <div 
              key={index}
              style={{ 
                padding: '8px 12px',
                backgroundColor: '#1f2937',
                borderRadius: 6,
                border: '1px solid #374151',
                fontSize: '0.9em',
                color: '#e5e7eb',
                textAlign: 'center'
              }}
            >
              {committee}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          padding: '16px 12px',
          backgroundColor: '#374151',
          borderRadius: 6,
          border: '1px solid #4b5563',
          fontSize: '0.9em',
          color: '#9ca3af',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Not Part of Any Committees
        </div>
      )}
      <div style={{ 
        color: '#a1a1aa', 
        fontSize: '0.75em', 
        marginTop: 12, 
        textAlign: 'center' 
      }}>
        *Committee assignments for 119th Congress
      </div>
    </div>
  );
}
