import { Router } from 'express';
import { isDemoMode, getDemoDeploys } from '../../lib/demo.js';
import { fetchDeploys } from '../../lib/clients/netlify.js';
import { getNetlifySites } from '../../lib/config.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let sites;

    if (isDemoMode()) {
      sites = getDemoDeploys();
    } else {
      if (!process.env.NETLIFY_AUTH_TOKEN) {
        return res.render('partials/empty-state', {
          message: 'No Netlify token configured',
          hint: 'Add NETLIFY_AUTH_TOKEN to your .env file'
        });
      }
      const configured = getNetlifySites();
      if (configured.length === 0) {
        return res.render('partials/empty-state', {
          message: 'No Netlify sites configured',
          hint: 'Add HELM_NETLIFY_SITES to your .env file'
        });
      }
      sites = await fetchDeploys(configured);
    }

    res.render('partials/panel-deploys', { sites });
  } catch (err) {
    res.render('partials/error-state', {
      title: 'Failed to fetch deploys',
      detail: err.message
    });
  }
});

export default router;
