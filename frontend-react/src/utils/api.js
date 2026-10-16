const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const token = localStorage.getItem('ae_token');
  if (token) headers.Authorization = 'Bearer ' + token;

  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
    if (typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(API_BASE + path, { ...opts, headers });

  if (res.status === 401) {
    localStorage.removeItem('ae_token');
    localStorage.removeItem('ae_me');
    window.location.reload();
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
  return data;
}

export default api;
