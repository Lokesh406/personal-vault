import express from 'express';
import { getPersonalDetails, updatePersonalDetails } from '../controllers/personalDetailsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPersonalDetails)
  .post(protect, updatePersonalDetails);

export default router;
