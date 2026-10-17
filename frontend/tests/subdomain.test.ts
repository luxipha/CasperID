import { describe, expect, test } from 'vitest';
import { getSubdomainFromHostname } from '../utils/subdomain';

describe('getSubdomainFromHostname', () => {
  test('parses production subdomains', () => {
    expect(getSubdomainFromHostname('pay.casperid.com')).toBe('pay');
  });

  test('parses custom local .cid hosts', () => {
    expect(getSubdomainFromHostname('pay.casperid.cid')).toBe('pay');
  });

  test('parses localhost-based development hosts', () => {
    expect(getSubdomainFromHostname('pay.casperid.localhost')).toBe('pay');
    expect(getSubdomainFromHostname('pay.localhost')).toBe('pay');
  });

  test('keeps reserved hostnames out of contextual routing', () => {
    expect(getSubdomainFromHostname('admin.casperid.com')).toBeNull();
    expect(getSubdomainFromHostname('www.casperid.cid')).toBeNull();
  });
});
