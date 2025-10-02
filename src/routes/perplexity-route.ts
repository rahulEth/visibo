import {Router} from 'express';
import { visibility } from '../controllers/perplexity-controller';
import { validateParams } from '../middleware/perplexity-middleware';

const router = Router();

router.get('/visibility', validateParams, visibility)

export default router;


