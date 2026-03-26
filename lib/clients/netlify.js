/**
 * Netlify API client.
 * Fetches recent deploys for configured sites.
 */

const NETLIFY_API = 'https://api.netlify.com/api/v1';

function getToken() {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error('NETLIFY_AUTH_TOKEN not set');
  return token;
}

/**
 * Fetch recent deploys for a list of Netlify site IDs.
 * @param {Array<{id: string, name: string}>} sites - [{id: 'netlify-site-id', name: 'My Site'}]
 * @returns {Array<{name: string, deploys: Array}>}
 */
export async function fetchDeploys(sites) {
  const token = getToken();

  const results = await Promise.allSettled(
    sites.map(async (site) => {
      const response = await fetch(
        `${NETLIFY_API}/sites/${site.id}/deploys?per_page=3`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) {
        throw new Error(`Netlify API ${response.status} for ${site.name}`);
      }
      const deploys = await response.json();

      return {
        name: site.name,
        deploys: deploys.map(d => ({
          id: d.id,
          state: d.state,
          created_at: d.created_at,
          published_at: d.published_at,
          deploy_time: d.deploy_time,
          title: d.title || d.commit_message || null,
          branch: d.branch,
          error_message: d.error_message,
          context: d.context
        }))
      };
    })
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      name: sites[i].name,
      deploys: [],
      error: r.reason?.message
    };
  });
}
