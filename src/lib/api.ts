const API_BASE = '/api';

export function getToken(): string | null {
  try {
    const stored = localStorage.getItem('milu-auth');
    if (!stored) return null;
    return JSON.parse(stored)?.state?.token || null;
  } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

/** 带token的admin fetch */
export async function adminFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`/api/admin${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const api = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string, inviteCode: string, phone?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, inviteCode, phone }) }),
  verifyInvite: (code: string) => request(`/auth/verify-invite/${code}`),
  getProfile: () => request('/user/profile'),
  updateProfile: (data: any) => request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  submitVerification: (frontImg: string, backImg: string) =>
    request('/user/verification', { method: 'POST', body: JSON.stringify({ frontImg, backImg }) }),
  getVerification: () => request('/user/verification'),
  submitComplaint: (content: string) => request('/user/complaint', { method: 'POST', body: JSON.stringify({ content }) }),
  getWallet: () => request('/wallet'),
  bindBankCard: (name: string, cardNo: string, bankName: string) =>
    request('/wallet/bank-card', { method: 'POST', body: JSON.stringify({ name, cardNo, bankName }) }),
  recharge: (amount: number) => request('/wallet/recharge', { method: 'POST', body: JSON.stringify({ amount }) }),
  withdraw: (amount: number, cardNo: string) => request('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, cardNo }) }),
  getAuctions: () => request('/auction'),
  getAuction: (id: string) => request(`/auction/${id}`),
  inquiryPledge: (code: string) => request(`/auction/inquiry/${code}`),
  getPledges: () => request('/pledge'),
};

export default api;
