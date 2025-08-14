const API_BASE = 'http://localhost:8081/api';

export async function scrape(keyword, page, pages, options) {
  if (!keyword || !String(keyword).trim()) {
    throw new Error('scrape: "keyword" is required');
  }

  const timeoutMs = 8000;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const params = new URLSearchParams();
    params.set('keyword', keyword);
    if (page != null)  params.set('page', String(page));
    if (pages != null) params.set('pages', String(pages));

    console.log(`${API_BASE}/scrape?${params.toString()}`);
    const res = await fetch(`${API_BASE}/scrape?${params.toString()}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
