import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import api from '@/api';
import { env } from '@/shared/config/env';
import { errorHandler, notFoundHandler } from '@/shared/middleware';

import cookieParser from 'cookie-parser';

const app = express();

// The API runs behind a hosting proxy (e.g. Render). Trust one hop so req.ip is the
// real client IP, which the chat rate limiter relies on. Verify after deploying by
// checking that different visitors get different req.ip values.
app.set('trust proxy', 1);

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  credentials: true,
  origin: true,
}));

// Compression
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', api);

// 404 Handler (must be AFTER routes)
app.use(notFoundHandler);

// Global Error Handler (must be LAST)
app.use(errorHandler);

export default app;