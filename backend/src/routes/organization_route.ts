import { Router } from 'express';
import * as OrganizationController from '../controllers/organization_controller';

const router = Router();

router.get('/all', OrganizationController.getAllEvents);

export {router as OrganizationRouter};