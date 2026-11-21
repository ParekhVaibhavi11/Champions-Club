import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test DB connection (non-fatal if PostgreSQL not running yet during initial scaffold)
  await testConnection();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🏆 Champions Club Server running on port ${PORT}`);
    console.log(`⚡ Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();
