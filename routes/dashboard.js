import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.render('pages/dashboard', { title: 'Dashboard' }, (err, dashboardHtml) => {
    if (err) {
      console.error('Dashboard render error:', err);
      return res.status(500).send('Internal server error');
    }
    res.render('layout', { body: dashboardHtml, title: 'Dashboard', isDemoMode: res.locals.isDemoMode });
  });
});

router.get('/about', (req, res) => {
  res.render('pages/about', {}, (err, aboutHtml) => {
    if (err) {
      console.error('About render error:', err);
      return res.status(500).send('Internal server error');
    }
    res.render('layout', { body: aboutHtml, title: 'About', isDemoMode: res.locals.isDemoMode });
  });
});

export default router;
