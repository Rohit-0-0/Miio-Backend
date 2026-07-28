import type { Request, Response, NextFunction } from 'express';

export const testController = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.body,
  });
};