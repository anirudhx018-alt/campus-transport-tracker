import { io } from 'socket.io-client';

const API_BASE = '/api';

// Create real-time socket connection
export const socket = io(window.location.origin, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

// Helper for fetch requests
async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }
  return data.data;
}

// BUSES API
export const busAPI = {
  getAll: () => request('/buses'),
  getById: (id) => request(`/buses/${id}`),
  create: (data) => request('/buses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/buses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/buses/${id}`, { method: 'DELETE' }),
  assignRoute: (id, routeId) => request(`/buses/${id}/route`, { method: 'PATCH', body: JSON.stringify({ routeId }) }),
  updateStatus: (id, status) => request(`/buses/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

// ROUTES API
export const routeAPI = {
  getAll: () => request('/routes'),
  getById: (id) => request(`/routes/${id}`),
  create: (data) => request('/routes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/routes/${id}`, { method: 'DELETE' })
};

// STOPS API
export const stopAPI = {
  getAll: () => request('/stops'),
  getById: (id) => request(`/stops/${id}`),
  create: (data) => request('/stops', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/stops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/stops/${id}`, { method: 'DELETE' })
};

// ALERTS API
export const alertAPI = {
  getAll: () => request('/alerts'),
  create: (data) => request('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/alerts/${id}`, { method: 'DELETE' })
};

// STATS API
export const statAPI = {
  getStats: () => request('/stats')
};

// SIMULATION API
export const simulationAPI = {
  getStatus: () => request('/simulation/status'),
  start: () => request('/simulation/start', { method: 'POST' }),
  pause: () => request('/simulation/pause', { method: 'POST' }),
  setSpeed: (multiplier) => request('/simulation/speed', { method: 'POST', body: JSON.stringify({ multiplier }) }),
  reset: () => request('/simulation/reset', { method: 'POST' })
};
