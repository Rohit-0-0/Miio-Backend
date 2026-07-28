import type { Request, Response } from 'express';

export const testController = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.body,
  });
};