/**
 * Supabase Management API client.
 * Lists projects visible to the configured access token.
 */

const BASE_URL = 'https://api.supabase.com/v1';

function getToken() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error('SUPABASE_ACCESS_TOKEN not set');
  return token;
}

function headers() {
  return {
    'Authorization': `Bearer ${getToken()}`
  };
}

/**
 * List all projects visible to this token.
 * @returns {Array<{name: string, id: string, region: string, status: string}>}
 */
export async function listProjects() {
  const res = await fetch(`${BASE_URL}/projects`, { headers: headers() });
  if (!res.ok) throw new Error(`Supabase listProjects failed: ${res.status}`);
  const projects = await res.json();

  return projects.map(p => ({
    id: p.id,
    name: p.name,
    region: p.region,
    status: p.status,
    created_at: p.created_at
  }));
}
