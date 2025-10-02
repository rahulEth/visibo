import {Router} from 'express';
import { visibility } from '../controllers/grok-controller';
import { validateParams } from '../middleware/grok-middleware';

const router = Router();

router.get('/visibility', validateParams, visibility)

export default router;

