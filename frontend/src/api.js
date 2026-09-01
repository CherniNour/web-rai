const TOKEN_KEY = 'web_rai_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(method, url, body, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const config = { method, headers };
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    config.body = body;
  }

  const res = await fetch(url, config);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof data === 'object' && data.message ? data.message : 'Erreur serveur';
    if (res.status === 401 && !url.includes('/auth/login')) {
      setToken(null);
      window.location.href = '/login';
    }
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (url, options) => request('GET', url, undefined, options),
  post: (url, body, options) => request('POST', url, body, options),
  put: (url, body, options) => request('PUT', url, body, options),
  del: (url, options) => request('DELETE', url, undefined, options),
};

export const BASE_URL = '';
