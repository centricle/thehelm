/**
 * ACME Corp demo data generator.
 * Returns fake fleet data when DEMO_MODE=true.
 */

const ACME_SITES = [
  { name: 'Rocket Skates', url: 'https://rocket-skates.fyi', family: 'The Coyote', netlifyId: 'demo-rs', repo: 'acme-corp/rocket-skates' },
  { name: 'Anvil Express', url: 'https://anvil-express.us', family: 'The Coyote', netlifyId: 'demo-ae', repo: 'acme-corp/anvil-express' },
  { name: 'Giant Magnet', url: 'https://giant-magnet.us', family: 'The Coyote', netlifyId: 'demo-gm', repo: 'acme-corp/giant-magnet' },
  { name: 'Roadmap Dust', url: 'https://roadmap-dust.fyi', family: 'The Bird', netlifyId: 'demo-rd', repo: 'acme-corp/roadmap-dust' },
  { name: 'Tunnel Paint', url: 'https://tunnel-paint.us', family: 'The Bird', netlifyId: 'demo-tp', repo: 'acme-corp/tunnel-paint' },
  { name: 'Portable Hole', url: 'https://portable-hole.fyi', family: 'The Bunny', netlifyId: 'demo-ph', repo: 'acme-corp/portable-hole' },
  { name: 'Carrot Cache', url: 'https://carrot-cache.us', family: 'The Bunny', netlifyId: 'demo-cc', repo: 'acme-corp/carrot-cache' },
  { name: 'Disguise Kit', url: 'https://disguise-kit.fyi', family: 'The Bunny', netlifyId: 'demo-dk', repo: 'acme-corp/disguise-kit' },
];

const COMMIT_MESSAGES = [
  'fix: anvil trajectory calculation off by 3 degrees',
  'feat: add parachute failsafe to rocket skates',
  'fix: tunnel paint not rendering on solid walls',
  'chore: update roadrunner tracking frequency',
  'feat: portable hole now supports nested dimensions',
  'fix: giant magnet attracting wrong species',
  'refactor: simplify disguise detection algorithm',
  'feat: add carrot nutritional data for 47 varieties',
  'fix: rocket skates brake delay exceeds safety threshold',
  'docs: add warning about cliff proximity to anvil docs',
  'feat: tunnel paint now supports curved surfaces',
  'fix: magnet polarity reversed after firmware update',
  'chore: rotate ACME supplier API keys',
  'feat: add dust cloud opacity settings to roadmap',
  'fix: portable hole leaking into adjacent dimensions',
  'perf: reduce anvil delivery time by 200ms',
  'feat: disguise kit now includes roadrunner costume',
  'fix: carrot cache invalidation on harvest events',
  'refactor: extract explosion handler to shared module',
  'test: add cliff-edge boundary tests for all products',
];

const DEPLOY_TITLES = [
  'Deploy triggered by push to main',
  'Rebuild after config change',
  'Dependency update (acme-sdk 3.2.1)',
  'Hotfix: production crash on desert terrain',
  'Feature branch merge: rocket-v2',
  'Scheduled redeploy',
];

function randomPastDate(maxHoursAgo) {
  const ms = Math.random() * maxHoursAgo * 3600000;
  return new Date(Date.now() - ms).toISOString();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSha() {
  return Math.random().toString(16).substring(2, 9).padStart(7, '0');
}

export function isDemoMode() {
  return process.env.DEMO_MODE === 'true';
}

export function getDemoStatus() {
  return ACME_SITES.map(site => {
    const ok = Math.random() > 0.1; // 90% uptime
    return {
      name: site.name,
      url: site.url,
      family: site.family,
      status: ok ? 200 : (Math.random() > 0.5 ? 503 : 0),
      latency: ok ? randomInt(45, 350) : randomInt(5000, 8000),
      ok,
      error: ok ? undefined : (Math.random() > 0.5 ? 'Timeout' : 'Connection refused')
    };
  });
}

export function getDemoDeploys() {
  return ACME_SITES.slice(0, 6).map(site => ({
    name: site.name,
    deploys: Array.from({ length: randomInt(1, 3) }, (_, i) => ({
      id: `demo-${site.netlifyId}-${i}`,
      state: i === 0 ? 'ready' : pick(['ready', 'ready', 'error']),
      created_at: randomPastDate(i === 0 ? 4 : 72),
      published_at: randomPastDate(i === 0 ? 4 : 72),
      deploy_time: randomInt(12, 90),
      title: pick(DEPLOY_TITLES),
      branch: 'main',
      error_message: null,
      context: 'production'
    }))
  }));
}

export function getDemoProjects() {
  return [
    { id: 'demo-1', name: 'acme-coyote-db', region: 'us-east-1', status: 'ACTIVE_HEALTHY', created_at: '2024-06-15T00:00:00Z' },
    { id: 'demo-2', name: 'acme-bird-db', region: 'us-west-2', status: 'ACTIVE_HEALTHY', created_at: '2024-08-01T00:00:00Z' },
    { id: 'demo-3', name: 'acme-bunny-db', region: 'eu-west-1', status: 'ACTIVE_HEALTHY', created_at: '2025-01-10T00:00:00Z' },
    { id: 'demo-4', name: 'acme-staging', region: 'us-east-1', status: 'INACTIVE', created_at: '2024-03-20T00:00:00Z' },
  ];
}

export function getDemoGitActivity() {
  return ACME_SITES.map(site => ({
    name: site.name,
    repo: site.repo,
    pushedAt: randomPastDate(randomInt(1, 720)),
    latestCommit: {
      sha: randomSha(),
      message: pick(COMMIT_MESSAGES),
      date: randomPastDate(randomInt(1, 168))
    },
    openIssues: randomInt(0, 5)
  }));
}