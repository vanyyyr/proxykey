/**
 * Webshare.io API Client
 * Docs: https://apidocs.webshare.io/
 * Auth: Authorization: Token <API_KEY>
 * Base URL: https://proxy.webshare.io/api/v2
 */

const WEBSHARE_API_KEY = process.env.WEBSHARE_API_KEY || '';
const BASE_URL = 'https://proxy.webshare.io/api/v2';

interface WebshareProxy {
  id: string;
  username: string;
  password: string;
  proxy_address: string;
  port: number;
  valid: boolean;
  last_verification: string | null;
  country_code: string;
  city_name: string | null;
  asn_name: string | null;
  asn_number: number | null;
  high_country_confidence: boolean;
  created_at: string;
}

interface WebsharePlan {
  id: number;
  status: string;
  bandwidth_limit: number;
  monthly_price: number;
  yearly_price: number;
  proxy_type: string;
  proxy_subtype: string;
  proxy_count: number;
  proxy_countries: Record<string, number>;
  [key: string]: unknown;
}

interface WebshareConfig {
  id: number;
  username: string;
  password: string;
  countries: Record<string, number>;
  available_countries: Record<string, number>;
  [key: string]: unknown;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function webshareRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!WEBSHARE_API_KEY) {
    throw new Error('WEBSHARE_API_KEY is not configured');
  }

  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${WEBSHARE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 429) {
    throw new Error('Webshare rate limit exceeded');
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Webshare API error: HTTP ${res.status} - ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

export async function getProxyList(
  mode: 'direct' | 'backbone' = 'direct',
  options: { countryCode?: string; page?: number; pageSize?: number } = {}
): Promise<PaginatedResponse<WebshareProxy>> {
  const params = new URLSearchParams({ mode });
  if (options.countryCode) params.append('country_code__in', options.countryCode);
  if (options.page) params.append('page', String(options.page));
  if (options.pageSize) params.append('page_size', String(options.pageSize));

  return webshareRequest(`/proxy/list/?${params.toString()}`);
}

export async function getAllProxies(mode: 'direct' | 'backbone' = 'direct'): Promise<WebshareProxy[]> {
  const allProxies: WebshareProxy[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await getProxyList(mode, { page, pageSize: 100 });
    allProxies.push(...data.results);
    hasMore = data.next !== null;
    page++;
  }

  return allProxies;
}

export async function getSubscriptionPlan(): Promise<WebsharePlan[]> {
  const data = await webshareRequest<PaginatedResponse<WebsharePlan>>('/subscription/plan/');
  return data.results;
}

export async function getAvailableAssets(): Promise<Record<string, unknown>> {
  return webshareRequest('/subscription/available_assets/');
}

export async function getProxyConfig(): Promise<WebshareConfig> {
  return webshareRequest('/proxy/config/');
}

export async function refreshProxyList(): Promise<unknown> {
  return webshareRequest('/proxy/ondemand_refresh/', { method: 'POST' });
}

export async function getAvailableCountries(): Promise<Record<string, number>> {
  try {
    const config = await getProxyConfig();
    return config.available_countries || {};
  } catch {
    return {};
  }
}

export type { WebshareProxy, WebsharePlan, WebshareConfig };
