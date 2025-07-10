import congressDataRaw from './congress_finance.json';
import tradesDataRaw from './congress_trades.json';

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
  firstElection: number;
  nextElection: number | string;
  financeMix: FinanceMix;
  topContributors: Contributor[];
  topIndustries: Industry[];
  stockValueUSD: number;
  tradesCount?: number;
  photoUrl?: string;
  committees?: string[];
};

export type Puzzle = {
  memberId: string;
  financeMix: FinanceMix;
  topContributors: Contributor[];
  topIndustries: Industry[];
  stockValueUSD: number;
  tradesCount?: number;
  committees?: string[];
  answer: {
    fullName: string;
    state: string;
    party: 'D' | 'R' | 'I';
    photoUrl?: string;
    firstElection: number;
    nextElection: number | string;
  };
};

// Helper functions to map JSON fields to RosterMember fields
function mapParty(party: string): 'D' | 'R' | 'I' {
  if (party === 'Democrat') return 'D';
  if (party === 'Republican') return 'R';
  return 'I';
}
function mapChamber(chamber: string): 'House' | 'Senate' {
  if (chamber === 'House' || chamber === 'Senate') return chamber;
  // fallback: if party field is 'House' or 'Senate' in the JSON
  if (chamber === 'Democrat' || chamber === 'Republican') return 'House';
  return 'House';
}
function mapState(state: string): string {
  // If state is full name, convert to abbreviation if needed (implement as needed)
  return state;
}

function computeShares<T extends { amount: number }>(arr: T[]): (T & { share: number })[] {
  const total = arr.reduce((sum, x) => sum + x.amount, 0);
  return arr.map(x => ({ ...x, share: total ? x.amount / total : 0 }));
}

// Build a map from name (lowercase) to trades_volume
const tradesMap = new Map<string, { volume: number, count: number }>();
(tradesDataRaw as any[]).forEach((entry: any) => {
  if (entry.name && typeof entry.trades_volume === 'number') {
    tradesMap.set(entry.name.toLowerCase(), {
      volume: entry.trades_volume,
      count: entry.trades_count ?? 0,
    });
  }
});

export const roster: RosterMember[] = (congressDataRaw as any[]).map((m: any) => {
  const trade = tradesMap.get((m.fullName || '').toLowerCase());
  const stockValueUSD = trade?.volume ?? 0;
  const tradesCount = trade?.count ?? 0;
  return {
    memberId: m.memberId,
    fullName: m.fullName,
    state: mapState(m.state),
    party: mapParty(m.chamber),
    chamber: mapChamber(m.party),
    firstElection: m.firstElection,
    nextElection: m.nextElection,
    financeMix: (typeof m.financeMix === 'object' && m.financeMix !== null) ? {
      large: {
        pct: m.financeMix.largeIndividualContributions?.pct ?? 0,
        amount: m.financeMix.largeIndividualContributions?.amount ?? 0,
      },
      small: {
        pct: m.financeMix["smallIndividualContributions(<$200)"]?.pct ?? 0,
        amount: m.financeMix["smallIndividualContributions(<$200)"]?.amount ?? 0,
      },
      pac: {
        pct: m.financeMix.pACContributions?.pct ?? 0,
        amount: m.financeMix.pACContributions?.amount ?? 0,
      },
      other: {
        pct: m.financeMix.other?.pct ?? 0,
        amount: m.financeMix.other?.amount ?? 0,
      },
      self: {
        pct: m.financeMix["candidateSelf-financing"]?.pct ?? 0,
        amount: m.financeMix["candidateSelf-financing"]?.amount ?? 0,
      },
    } : {
      large: { pct: 0, amount: 0 },
      small: { pct: 0, amount: 0 },
      pac: { pct: 0, amount: 0 },
      other: { pct: 0, amount: 0 },
      self: { pct: 0, amount: 0 },
    },
    topContributors: computeShares(Array.isArray(m.topContributors) ? m.topContributors.map((c: any) => ({
      name: c.name,
      amount: c.amount,
    })) : []),
    topIndustries: computeShares(Array.isArray(m.topIndustries) ? m.topIndustries.map((i: any) => ({
      name: i.name,
      amount: i.amount,
    })) : []),
    stockValueUSD,
    tradesCount,
    photoUrl: undefined, // If available in JSON, map it here
    committees: Array.isArray(m.committees) ? m.committees : [],
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
    committees: member.committees,
    answer: {
      fullName: member.fullName,
      state: member.state,
      party: member.party,
      photoUrl: member.photoUrl,
      firstElection: member.firstElection,
      nextElection: member.nextElection,
    },
  };
} 