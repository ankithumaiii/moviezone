import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

app.use(express.json());

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend assets if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Express 5 compatible SPA fallback for non-API routes
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Global 404 handler for unmatched API routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found or route not permitted' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[MovieZone Backend] Server listening on port ${PORT}`);
});

export default app;
