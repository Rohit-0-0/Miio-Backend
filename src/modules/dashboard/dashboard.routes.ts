import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.get('/', dashboardController.getDashboardStats.bind(dashboardController));

export default router;
