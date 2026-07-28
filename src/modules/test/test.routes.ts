import { Router } from 'express';

import { validate } from '@/shared/validation';
import { testController } from './test.controller.js';
import { testSchema } from './test.schema.js';

const router = Router();

router.post('/', validate(testSchema), testController);

export default router;