import { Router } from 'express';
import { isDemoMode, getDemoStatus } from '../../lib/demo.js';
import { getSites } from '../../lib/config.js';
import { checkSites } from '../../lib/clients/status.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let sites;

    if (isDemoMode()) {
      sites = getDemoStatus();
    } else {
      const configured = getSites();
      if (configured.length === 0) {
        return res.render('partials/empty-state', {
          message: 'No sites configured',
          hint: 'Add HELM_SITES to your .env file'
        });
      }

      sites = await checkSites(configured);
    }

    res.render('partials/panel-status', { sites });
  } catch (err) {
    res.render('partials/error-state', {
      title: 'Failed to check status',
      detail: err.message
    });
  }
});

export default router;
