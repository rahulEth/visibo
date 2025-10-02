import {Router} from 'express';
import { visibility } from '../controllers/openai-controller';
import { validateParams } from '../middleware/openai-middleware';

const router = Router();

router.get('/visibility', validateParams, visibility)

export default router;


