import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const dashboardData = await dashboardService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
      });
    }
  }
}

export const dashboardController = new DashboardController();
