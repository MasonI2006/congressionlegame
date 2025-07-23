import congressDataRaw from '../CongressData/Main119thCongressData.json';

export type FinanceMix = {
  large: { pct: number; amount: number };
  small: { pct: number; amount: number };
  pac: { pct: number; amount: number };
  other: { pct: number; amount: number };
  self: { pct: number; amount: number };
};

export type Contributor = {
  name: string;
  share: number;
  amount: number;
};

export type Industry = {
  name: string;
  share: number;
  amount: number;
};

export type RosterMember = {
  memberId: string;
  fullName: string;
  state: string;
  party: 'D' | 'R' | 'I';
  chamber: 'House' | 'Senate';
  financeMix: FinanceMix;
  topContributors: Contributor[];
  topIndustries: Industry[];
  stockValueUSD: number;
  tradesCount: number;
  tickerHoldingCount: number;
  currentNetWorth: number;
  amountRaised: number;
  committees: string[];
  corporatePACMoney: number;
  maxDonors: string[];
  uniqueDonors: string[];
  lat: number;
  lon: number;
  photoUrl?: string;
  websiteUrl?: string;
};

export type Puzzle = {
  memberId: string;
  financeMix: FinanceMix;
  topContributors: Contributor[];
  topIndustries: Industry[];
  stockValueUSD: number;
  tradesCount: number;
  tickerHoldingCount: number;
  currentNetWorth: number;
  amountRaised: number;
  committees: string[];
  corporatePACMoney: number;
  maxDonors: string[];
  uniqueDonors: string[];
  answer: {
    fullName: string;
    state: string;
    party: 'D' | 'R' | 'I';
    lat: number;
    lon: number;
    photoUrl?: string;
    websiteUrl?: string;
  };
};

// Helper functions
function parseAmount(amountStr: string | number): number {
  if (typeof amountStr === 'number') return amountStr;
  if (typeof amountStr !== 'string') return 0;
  return parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
}

function parsePercentage(percentStr: string | number): number {
  if (typeof percentStr === 'number') return percentStr;
  if (typeof percentStr !== 'string') return 0;
  return parseFloat(percentStr.replace('%', '')) || 0;
}

function computeShares<T extends { amount: number }>(arr: T[]): (T & { share: number })[] {
  const total = arr.reduce((sum, x) => sum + x.amount, 0);
  return arr.map(x => ({ ...x, share: total ? x.amount / total : 0 }));
}

export const roster: RosterMember[] = (congressDataRaw as any[]).map((m: any) => {
  // Extract state from "State and District" field (e.g., "CA-12" -> "CA")
  const stateDistrict = m['State and District'] || '';
  const state = stateDistrict.split('-')[0] || '';
  
  // Parse party
  const party = m.Party === 'D' ? 'D' : 
               m.Party === 'R' ? 'R' : 'I';
  
  // Parse chamber
  const chamber = m.Chamber === 'House' || m.Chamber === 'Senate' ? m.Chamber : 'House';
  
  // Parse amount raised
  const amountRaised = parseAmount(m['Amount Raised'] || '$0');
  
  // Parse finance mix percentages
  const largePct = parsePercentage(m['% Large Donors'] || '0%');
  const smallPct = parsePercentage(m['% (<$200)'] || '0%');
  const pacPct = parsePercentage(m['% PACs'] || '0%');
  const otherPct = parsePercentage(m['% Other'] || '0%');
  const selfPct = parsePercentage(m['% Self-financed'] || '0%');
  
  // Calculate amounts from percentages
  const largeAmount = (largePct / 100) * amountRaised;
  const smallAmount = (smallPct / 100) * amountRaised;
  const pacAmount = (pacPct / 100) * amountRaised;
  const otherAmount = (otherPct / 100) * amountRaised;
  const selfAmount = (selfPct / 100) * amountRaised;
  
  // Parse top contributors
  const topContributors: Contributor[] = Array.isArray(m.topContributors) 
    ? m.topContributors.map((c: any) => ({
        name: String(c.name || ''),
        amount: parseAmount(c.amount || 0),
        share: 0 // Will be calculated below
      }))
    : [];
  
  // Parse top industries
  const topIndustries: Industry[] = Array.isArray(m.topIndustries) 
    ? m.topIndustries.map((i: any) => ({
        name: String(i.name || ''),
        amount: parseAmount(i.amount || 0),
        share: 0 // Will be calculated below
      }))
    : [];
  
  // Calculate shares for contributors and industries
  const contributorsWithShares = computeShares(topContributors);
  const industriesWithShares = computeShares(topIndustries);
  
  // Parse trade data
  const tradesCount = parseInt(String(m['Trade Count'] || '0'), 10) || 0;
  const stockValueUSD = parseAmount(m['Est Trade Volume'] || 0);
  
  // Parse ticker holding count - handle both numeric and "No Holdings Data" cases
  const tickerHoldingCountRaw = m['Ticker Holding Count'];
  const tickerHoldingCount = (typeof tickerHoldingCountRaw === 'number') ? tickerHoldingCountRaw : 0;
  
  // Parse current net worth
  const currentNetWorth = parseAmount(m['Current_Net_Worth'] || 0);
  
  // Parse committees - split by semicolon and filter out empty/none entries
  const committeesRaw = String(m.Committees || '');
  const committees = committeesRaw
    .split(';')
    .map(c => c.trim())
    .filter(c => {
      if (!c) return false;
      const lowerC = c.toLowerCase();
      // Filter out variations of "none"
      return lowerC !== 'n' && 
             lowerC !== 'o' && 
             lowerC !== 'e' && 
             lowerC !== 'none' &&
             lowerC !== 'no' &&
             !(lowerC.length === 1 && ['n', 'o', 'e'].includes(lowerC));
    });
  
  // Parse Corporate PAC money
  const corporatePACMoney = parseAmount(m['CorporatePAC Money'] || 0);
  
  // Parse Max Donors - split by semicolon and filter out "No donors"
  const maxDonorsRaw = String(m['2024 Max Donors'] || '');
  const maxDonors = maxDonorsRaw.toLowerCase().includes('no donors') ? [] : 
    maxDonorsRaw
      .split(';')
      .map(d => d.trim())
      .filter(d => d && !d.toLowerCase().includes('no donors'));
  
  // Parse Unique Donors - split by semicolon and filter out "No donors"
  const uniqueDonorsRaw = String(m['2024 Unique Donors'] || '');
  const uniqueDonors = uniqueDonorsRaw.toLowerCase().includes('no donors') ? [] :
    uniqueDonorsRaw
      .split(';')
      .map(d => d.trim())
      .filter(d => d && !d.toLowerCase().includes('no donors'));
  
  return {
    memberId: String(m.Name || ''),
    fullName: String(m.Name || ''),
    state,
    party,
    chamber,
    amountRaised,
    financeMix: {
      large: { pct: largePct, amount: largeAmount },
      small: { pct: smallPct, amount: smallAmount },
      pac: { pct: pacPct, amount: pacAmount },
      other: { pct: otherPct, amount: otherAmount },
      self: { pct: selfPct, amount: selfAmount }
    },
    topContributors: contributorsWithShares,
    topIndustries: industriesWithShares,
    stockValueUSD,
    tradesCount,
    tickerHoldingCount,
    currentNetWorth,
    committees,
    corporatePACMoney,
    maxDonors,
    uniqueDonors,
    lat: parseFloat(String(m.INTPTLAT || '0')) || 0,
    lon: parseFloat(String(m.INTPTLON || '0')) || 0,
    photoUrl: String(m.PHOTOURL || ''),
    websiteUrl: String(m.WEBSITEURL || '')
  };
});

export function getPuzzleForMember(member: RosterMember): Puzzle {
  return {
    memberId: member.memberId,
    financeMix: {
      large: { pct: member.financeMix.large.pct, amount: member.financeMix.large.amount },
      small: { pct: member.financeMix.small.pct, amount: member.financeMix.small.amount },
      pac: { pct: member.financeMix.pac.pct, amount: member.financeMix.pac.amount },
      other: { pct: member.financeMix.other.pct, amount: member.financeMix.other.amount },
      self: { pct: member.financeMix.self.pct, amount: member.financeMix.self.amount }
    },
    topContributors: member.topContributors.map(c => ({ name: c.name, share: c.share, amount: c.amount })),
    topIndustries: member.topIndustries.map(i => ({ name: i.name, share: i.share, amount: i.amount })),
    stockValueUSD: member.stockValueUSD,
    tradesCount: member.tradesCount,
    tickerHoldingCount: member.tickerHoldingCount,
    currentNetWorth: member.currentNetWorth,
    amountRaised: member.amountRaised,
    committees: member.committees,
    corporatePACMoney: member.corporatePACMoney,
    maxDonors: member.maxDonors,
    uniqueDonors: member.uniqueDonors,
    answer: {
      fullName: member.fullName,
      state: member.state,
      party: member.party,
      lat: member.lat,
      lon: member.lon,
      photoUrl: member.photoUrl,
      websiteUrl: member.websiteUrl
    }
  };
} 