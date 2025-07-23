'use client';
import React from 'react';

export default function CorporatePACCard({ 
  corporatePACMoney, 
  maxDonors, 
  uniqueDonors 
}: { 
  corporatePACMoney?: number, 
  maxDonors?: string[], 
  uniqueDonors?: string[] 
}) {
  const hasPACMoney = corporatePACMoney && corporatePACMoney > 0;
  const hasMaxDonors = maxDonors && maxDonors.length > 0;
  const hasUniqueDonors = uniqueDonors && uniqueDonors.length > 0;

  return (
    <div className="card centered" style={{ minWidth: 320, maxWidth: 400, padding: '24px' }}>
      <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 16 }}>Corporate PAC Money</h3>
      <div style={{ fontSize: '2em', fontWeight: 700, color: hasPACMoney ? '#10b981' : '#6b7280', marginBottom: 16 }}>
        {hasPACMoney ? `$${corporatePACMoney.toLocaleString()}` : '$0'}
      </div>
      
      {!hasPACMoney ? (
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
          No Corporate PAC Donations
        </div>
      ) : (
        <>
          {hasMaxDonors && (
            <>
              <h4 className="title" style={{ fontSize: '1em', marginBottom: 12, color: '#a1a1aa' }}>
                Received Max Donations from
                <span style={{ color: '#a1a1aa', fontSize: '0.8em', marginLeft: 8 }}>
                  ({maxDonors.length})
                </span>
              </h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 6, 
                maxHeight: 150, 
                overflowY: 'auto',
                marginBottom: 16
              }}>
                {maxDonors.slice(0, 8).map((donor, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '6px 10px',
                      backgroundColor: '#dc2626',
                      borderRadius: 4,
                      border: '1px solid #ef4444',
                      fontSize: '0.8em',
                      color: '#fef2f2',
                      textAlign: 'left',
                      lineHeight: 1.3
                    }}
                  >
                    {donor}
                  </div>
                ))}
                {maxDonors.length > 8 && (
                  <div style={{ 
                    color: '#a1a1aa', 
                    fontSize: '0.75em', 
                    textAlign: 'center',
                    marginTop: 4
                  }}>
                    + {maxDonors.length - 8} more max donors
                  </div>
                )}
              </div>
            </>
          )}

          {hasUniqueDonors && (
            <>
              <h4 className="title" style={{ fontSize: '1em', marginBottom: 12, color: '#a1a1aa' }}>
                {hasMaxDonors ? 'All Unique Corporate PAC Donors' : 'Unique Corporate PAC Donors'}
                <span style={{ color: '#a1a1aa', fontSize: '0.8em', marginLeft: 8 }}>
                  ({uniqueDonors.length})
                </span>
              </h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 6, 
                maxHeight: hasMaxDonors ? 120 : 200, 
                overflowY: 'auto' 
              }}>
                {uniqueDonors.slice(0, hasMaxDonors ? 6 : 10).map((donor, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '6px 10px',
                      backgroundColor: '#1f2937',
                      borderRadius: 4,
                      border: '1px solid #374151',
                      fontSize: '0.8em',
                      color: '#e5e7eb',
                      textAlign: 'left',
                      lineHeight: 1.3
                    }}
                  >
                    {donor}
                  </div>
                ))}
                {uniqueDonors.length > (hasMaxDonors ? 6 : 10) && (
                  <div style={{ 
                    color: '#a1a1aa', 
                    fontSize: '0.75em', 
                    textAlign: 'center',
                    marginTop: 4
                  }}>
                    + {uniqueDonors.length - (hasMaxDonors ? 6 : 10)} more unique donors
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      
      <div style={{ 
        color: '#a1a1aa', 
        fontSize: '0.75em', 
        marginTop: 12, 
        textAlign: 'center' 
      }}>
        *2024 Corporate PAC contributions
      </div>
    </div>
  );
}
