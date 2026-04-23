import express from 'express';
import cors from 'cors';
import path from 'path';

export function createApp() {
  const app = express();

  // ⭐ これを追加
  const distPath = path.resolve(process.cwd(), 'app/dist');
  const gamesPath = path.resolve(process.cwd(), 'Games');

  app.use(express.static(distPath));
  app.use('/games', express.static(gamesPath));

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SPA fallback (serve index.html for all non-API routes)
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  return app;
}
