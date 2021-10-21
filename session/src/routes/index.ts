import { Router } from 'express';

const router = Router();

import get from './get';
router.get('/', get);

export default router;
