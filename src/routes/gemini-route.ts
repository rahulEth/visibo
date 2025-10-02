import {Router} from 'express';
import { visibility } from '../controllers/gemini-controller';
import { validateParams } from '../middleware/gemini-middleware';

const router = Router();

router.get('/visibility', validateParams, visibility)

export default router;


