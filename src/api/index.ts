import { Router } from 'express';

import apiRoutes from './routes/index.js';

const api = Router();

api.use('/v1', apiRoutes);

export default api;