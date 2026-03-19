import { Router } from 'express';
import { authMiddleware } from '../middleware/auth_middleware';
import * as EventManagementController from '../controllers/event_management_controller';

const router = Router();

// public
router.get('/events', EventManagementController.getAllEvents);

// org routes
router.get('/org/events/:userID', EventManagementController.getOrgEvents);
router.post('/org/events', authMiddleware, EventManagementController.createEvent);
router.get('/org/events/:id', EventManagementController.getEventById);
router.get('/org/events/:id/partners', EventManagementController.getEventPartners);
router.put('/org/events/:id', authMiddleware, EventManagementController.updateEvent);

// corp routes
router.get('/corp/events/:userID', EventManagementController.getCorpEvents);
router.get('/corp/:corpID/history', EventManagementController.getPastEventsForCorporation);
export { router as EventManagementRouter };