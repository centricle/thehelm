import { Router } from 'express';
import { isDemoMode, getDemoGitActivity } from '../../lib/demo.js';
import { fetchGitActivity } from '../../lib/clients/github.js';
import { getGithubRepos } from '../../lib/config.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let repos;

    if (isDemoMode()) {
      repos = getDemoGitActivity();
    } else {
      if (!process.env.GITHUB_TOKEN) {
        return res.render('partials/empty-state', {
          message: 'No GitHub token configured',
          hint: 'Add GITHUB_TOKEN to your .env file'
        });
      }
      const configured = getGithubRepos();
      if (configured.length === 0) {
        return res.render('partials/empty-state', {
          message: 'No GitHub repos configured',
          hint: 'Add HELM_GITHUB_REPOS to your .env file'
        });
      }
      repos = await fetchGitActivity(configured);
    }

    res.render('partials/panel-git', { repos });
  } catch (err) {
    res.render('partials/error-state', {
      title: 'Failed to fetch git activity',
      detail: err.message
    });
  }
});

export default router;
