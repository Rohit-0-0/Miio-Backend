import { Router } from 'express';
import { EditorialController } from './editorial.controller';

const router = Router();
const controller = new EditorialController();

router.get('/about', controller.getAbout);
router.get('/locations', controller.getLocations);
router.get('/locations/:slug', controller.getLocation);

export default router;
