const DEFAULT_API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "http://localhost:8082/api";

/**
 * Fetch Amazon scrape results.
 * @param {string} keyword - required
 * @param {number} [page]
 * @param {number} [pages]
 * @returns {Promise<object>}
 */
export async function scrape(keyword, page, pages) {
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

        const res = await fetch(`${DEFAULT_API_BASE}/scrape?${params.toString()}`, {
        signal: ctrl.signal,
        headers: { Accept: 'application/json' }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(t);
    }
}
