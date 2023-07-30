interface StatTotals {
  donoCount: number;
  donoTotal: number;
  raffleTotal: number;
  raffleDonoCount: number;
}

interface TodaysTotals {
  yeeTotal: number;
  pepeTotal: number;
  total: number;
}
interface DonationData {
  isActive?: boolean;
  sponsor: string;
  date: string;
  location: string;
  amount: number;
  message: string;
}
interface YeeAndPepeTotal {
  yeeDonoTotal: number;
  pepeDonoTotal: number;
}
interface AuthorizationEntry {
  isActive: boolean;
  accessCode: string;
  alias: string;
  note: string;
}
