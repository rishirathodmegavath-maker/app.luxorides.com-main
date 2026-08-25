import { POLICIES } from './policy.data';
import { Policy, PolicyType } from './policy.model';

export function getPolicies(): Policy[] {
  return POLICIES;
}

export function getPolicy(type: PolicyType): Policy | undefined {
  return POLICIES.find(p => p.type === type);
}