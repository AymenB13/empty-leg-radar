export type SignalsFilter = {
  airports?: string[];
  status?: string[];
  probThreshold?: number;
};

export type HotHoursFilter = {
  icao?: string;
  limit?: number;
};

export type TailHabitsFilter = {
  nNumber?: string;
  isPart135?: boolean;
  limit?: number;
};

export type RTBRoutesFilter = {
  depIcao?: string;
  arrIcao?: string;
  limit?: number;
};

export type WatchlistFilters = {
  airports?: string[];
  dow?: number[];
  hour?: number[];
  nNumber?: string;
  depIcao?: string;
  arrIcao?: string;
  isPart135?: boolean;
};
