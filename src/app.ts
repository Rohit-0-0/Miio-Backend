import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import api from '@/api';
import { errorHandler, notFoundHandler } from '@/shared/middleware';

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

// Routes
app.use('/api', api);

// 404 Handler (must be AFTER routes)
app.use(notFoundHandler);

// Global Error Handler (must be LAST)
app.use(errorHandler);

export default app;