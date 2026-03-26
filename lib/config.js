/**
 * User configuration.
 * Reads site/repo lists from environment variables.
 * Format: comma-separated, structured as name:value pairs.
 *
 * HELM_SITES = "My App|https://myapp.com,Blog|https://blog.example.com"
 * HELM_NETLIFY_SITES = "My App|site-uuid-here,Blog|other-uuid"
 * HELM_GITHUB_REPOS = "My App|owner/repo,Blog|owner/blog"
 */

function parseList(envVar, parser) {
  const raw = process.env[envVar];
  if (!raw) return [];
  return raw.split(',').map(entry => {
    const trimmed = entry.trim();
    if (!trimmed) return null;
    return parser(trimmed);
  }).filter(Boolean);
}

export function getSites() {
  return parseList('HELM_SITES', (entry) => {
    const [name, url] = entry.split('|');
    if (!name || !url) return null;
    return { name: name.trim(), url: url.trim() };
  });
}

export function getNetlifySites() {
  return parseList('HELM_NETLIFY_SITES', (entry) => {
    const [name, id] = entry.split('|');
    if (!name || !id) return null;
    return { name: name.trim(), id: id.trim() };
  });
}

export function getGithubRepos() {
  return parseList('HELM_GITHUB_REPOS', (entry) => {
    const [name, repo] = entry.split('|');
    if (!name || !repo) return null;
    return { name: name.trim(), repo: repo.trim() };
  });
}
