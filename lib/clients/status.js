/**
 * HTTP HEAD status checker.
 * Checks site availability with timeout and returns normalized results.
 */

/**
 * Check uptime for a list of sites via HTTP HEAD.
 * @param {Array<{name: string, url: string}>} sites
 * @returns {Promise<Array<{name: string, url: string, status: number, latency: number, ok: boolean, error?: string}>>}
 */
export async function checkSites(sites) {
  return Promise.all(
    sites.map(async (site) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(site.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow'
        });
        clearTimeout(timeout);
        return {
          name: site.name,
          url: site.url,
          status: response.status,
          latency: Date.now() - start,
          ok: response.ok
        };
      } catch (err) {
        return {
          name: site.name,
          url: site.url,
          status: 0,
          latency: Date.now() - start,
          ok: false,
          error: err.name === 'AbortError' ? 'Timeout' : err.message
        };
      }
    })
  );
}
