// ============================================================
//  API Service - connects frontend to backend
//  All API calls go through this file
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

// ─── Helper to get auth token from localStorage ───────────────
function getToken(): string | null {
  return localStorage.getItem('token');
}

// ─── Helper to make requests ──────────────────────────────────
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ─── AUTH APIs ────────────────────────────────────────────────

export async function signupUser(name: string, email: string, password: string) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request('/auth/me');
}

// ─── CALCULATION APIs ─────────────────────────────────────────

export async function calculateCO2(data: {
  productName: string;
  weight: number;
  distance: number;
  shippingMethod: string;
}) {
  return request('/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCalculations() {
  return request('/calculations');
}

export async function purchaseOffset(id: string) {
  return request(`/calculations/${id}/offset`, {
    method: 'PATCH',
  });
}

export async function deleteCalculation(id: string) {
  return request(`/calculations/${id}`, {
    method: 'DELETE',
  });
}

export async function getStats() {
  return request('/stats');
}
