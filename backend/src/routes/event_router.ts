import { Router } from 'express';
import * as EventController from '../controllers/event_controller';

const router = Router();

router.get('/all', EventController.getAllEvents);

export {router as EventRouter};