import express from 'express';
import { authUser, setupAdmin, verifySecretCode } from '../controllers/authController.js';

const router = express.Router();

router.post('/verify-code', verifySecretCode);
router.post('/login', authUser);
router.post('/setup', setupAdmin);

export default router;
