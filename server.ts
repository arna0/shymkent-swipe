import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import feedRoutes from './src/server/routes/feedRoutes';
import { loadOrSeed, saveAll } from './src/server/db/sqlite';

async function startServer() {
  loadOrSeed();
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  app.use(express.json({ limit: '10mb' })); // photos arrive as data URLs

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Shymkent Swipe Backend API',
      timestamp: new Date().toISOString(),
      version: '2.4.0',
    });
  });

  // Save to SQLite after every request that changes data
  app.use('/api', (req, res, next) => {
    if (req.method !== 'GET') {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          try { saveAll(); } catch (err) { console.error('[db] save failed', err); }
        }
      });
    }
    next();
  });

  // Mount Feed & Swipe API Routes
  app.use('/api', feedRoutes);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Shymkent Swipe API Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
