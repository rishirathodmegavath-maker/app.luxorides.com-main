export type PolicyType = 'TERMS' | 'PRIVACY' | 'CANCELLATION';

export interface Policy {
  type: PolicyType;
  version: string;
  title: string;
  summaryPoints: string[];
  fullUrl: string;
  lastUpdated: string;
}