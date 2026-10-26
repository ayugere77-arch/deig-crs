export interface Report {
  id: string;
  trackingId?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organization: string;
  status: 'Submitted' | 'Under Review' | 'Investigation Started' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  evidence: string[];
  isAnonymous: boolean;
  reporter?: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  pending: number;
  investigating: number;
  resolved: number;
  trends: { name: string; reports: number }[];
  byCategory: { name: string; value: number }[];
  byLocation?: { name: string; cases: number }[];
}

export type UserRole = 'Investigator' | 'Supervisor' | 'Administrator';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type Language = 'en' | 'am' | 'om' | 'ti';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}
