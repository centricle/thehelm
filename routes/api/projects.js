import { Router } from 'express';
import { isDemoMode, getDemoProjects } from '../../lib/demo.js';
import { listProjects } from '../../lib/clients/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let projects;

    if (isDemoMode()) {
      projects = getDemoProjects();
    } else {
      if (!process.env.SUPABASE_ACCESS_TOKEN) {
        return res.render('partials/empty-state', {
          message: 'No Supabase token configured',
          hint: 'Add SUPABASE_ACCESS_TOKEN to your .env file'
        });
      }
      projects = await listProjects();
    }

    res.render('partials/panel-projects', { projects });
  } catch (err) {
    res.render('partials/error-state', {
      title: 'Failed to fetch projects',
      detail: err.message
    });
  }
});

export default router;
