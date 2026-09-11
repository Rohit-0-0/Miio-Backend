import { Router } from 'express';
import { EditorialController } from './editorial.controller';

const router = Router();
const controller = new EditorialController();

router.get('/about', controller.getAbout);
router.get('/locations', controller.getLocations);
router.get('/locations/:slug', controller.getLocation);
router.get('/journal-page', controller.getJournalPage);
router.get('/locations-page', controller.getLocationsPage);
router.get('/site-settings', controller.getSiteSettings);

export default router;
