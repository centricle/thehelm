import { Router } from 'express';
import { isDemoMode, getDemoStatus } from '../../lib/demo.js';
import { getSites } from '../../lib/config.js';
import { checkSites } from '../../lib/clients/status.js';

const router = Router();

function sendSSE(res, event, html) {
  const lines = html.replace(/\r\n/g, '\n').split('\n').map(line => `data: ${line}`).join('\n');
  res.write(`event: ${event}\n${lines}\n\n`);
}

async function tick(req, res) {
  let sites;

  if (isDemoMode()) {
    sites = getDemoStatus();
  } else {
    const configured = getSites();
    if (configured.length === 0) {
      sendSSE(res, 'status', '');
      return;
    }

    sites = await checkSites(configured);
  }

  const html = await new Promise((resolve, reject) => {
    req.app.render('partials/panel-status', { sites }, (err, rendered) => {
      if (err) reject(err);
      else resolve(rendered);
    });
  });

  sendSSE(res, 'status', html);
}

router.get('/', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });
  res.flushHeaders();

  res.write('retry: 30000\n\n');

  // Fire immediately, then every 30s
  tick(req, res).catch(err => console.error('SSE check failed:', err));

  const interval = setInterval(async () => {
    if (res.writableEnded) {
      clearInterval(interval);
      return;
    }
    try {
      await tick(req, res);
    } catch (err) {
      console.error('SSE check failed:', err);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
