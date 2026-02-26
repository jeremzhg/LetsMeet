import { Router } from 'express';
import { authMiddleware } from '../middleware/auth_middleware';
import * as EventManagementController from '../controllers/event_management_controller';

const router = Router();

router.get('/events', EventManagementController.getAllEvents);
router.post('/events', authMiddleware, EventManagementController.createEvent);
router.get('/events/:id', EventManagementController.getEventById);

export {router as EventManagementRouter};