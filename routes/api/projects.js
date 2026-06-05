import { Router } from 'express';
import { isDemoMode, getDemoProjects } from '../../lib/demo.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    if (isDemoMode()) {
      const projects = getDemoProjects();
      res.render('partials/panel-projects', { projects });
    } else {
      res.render('partials/empty-state', {
        message: 'No database monitoring configured',
        hint: 'Database health checks run in demo mode only'
      });
    }
  } catch (err) {
    res.render('partials/error-state', {
      title: 'Failed to fetch projects',
      detail: err.message
    });
  }
});

export default router;
