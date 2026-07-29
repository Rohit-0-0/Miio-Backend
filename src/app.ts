import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import api from '@/api';
import { env } from '@/shared/config/env';
import { errorHandler, notFoundHandler } from '@/shared/middleware';

import cookieParser from 'cookie-parser';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  credentials: true,
  origin: env.NEXT_PUBLIC_APP_URL,
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