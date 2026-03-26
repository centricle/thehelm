/**
 * GitHub GraphQL client.
 * Fetches latest commit + open issues for configured repos.
 */

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

function getToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  return token;
}

function buildQuery(repos) {
  const varDefs = repos.map((_, i) =>
    `$owner${i}: String!, $name${i}: String!`
  ).join(', ');

  const fragments = repos.map((_, i) => `
      repo${i}: repository(owner: $owner${i}, name: $name${i}) {
        name
        pushedAt
        defaultBranchRef {
          target {
            ... on Commit {
              oid
              message
              author { date }
            }
          }
        }
        issues(states: OPEN) { totalCount }
      }
  `);

  const query = `query(${varDefs}) { ${fragments.join('\n')} }`;

  const variables = {};
  repos.forEach((r, i) => {
    const [owner, name] = r.repo.split('/');
    variables[`owner${i}`] = owner;
    variables[`name${i}`] = name;
  });

  return { query, variables };
}

/**
 * Fetch git activity for a list of repos.
 * @param {Array<{name: string, repo: string}>} repos - [{name: 'My App', repo: 'owner/repo'}]
 * @returns {Array<{name: string, repo: string, pushedAt: string, latestCommit: object, openIssues: number}>}
 */
export async function fetchGitActivity(repos) {
  const token = getToken();

  // Batch into groups of 10
  const batches = [];
  for (let i = 0; i < repos.length; i += 10) {
    batches.push(repos.slice(i, i + 10));
  }

  const batchResults = await Promise.allSettled(
    batches.map(async (batch) => {
      const { query, variables } = buildQuery(batch);
      const response = await fetch(GITHUB_GRAPHQL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        throw new Error(`GitHub GraphQL ${response.status}`);
      }

      const json = await response.json();
      if (json.errors) {
        console.warn('GitHub GraphQL errors:', json.errors.map(e => e.message).join(', '));
      }
      return { data: json.data, batch };
    })
  );

  const data = [];

  batchResults.forEach((result, batchIndex) => {
    if (result.status !== 'fulfilled') {
      batches[batchIndex].forEach(repo => {
        data.push({ name: repo.name, repo: repo.repo, error: 'Request failed' });
      });
      return;
    }

    const { data: graphqlData, batch } = result.value;

    batch.forEach((repo, i) => {
      const repoData = graphqlData?.[`repo${i}`];
      if (!repoData) {
        data.push({ name: repo.name, repo: repo.repo, error: 'Not found or no access' });
        return;
      }

      const commit = repoData.defaultBranchRef?.target;
      data.push({
        name: repo.name,
        repo: repo.repo,
        pushedAt: repoData.pushedAt,
        latestCommit: commit ? {
          sha: commit.oid?.substring(0, 7),
          message: commit.message,
          date: commit.author?.date
        } : null,
        openIssues: repoData.issues?.totalCount ?? 0
      });
    });
  });

  return data;
}
