import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import {
  errorHandler,
  notFoundHandler,
} from '@/shared/middleware';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Compression
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(notFoundHandler);

app.use(errorHandler);

// Health Check
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Miio Backend is running.',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

export default app;