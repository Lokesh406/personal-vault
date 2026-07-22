import express from 'express';
import { getLinks, createLink, deleteLink } from '../controllers/linkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getLinks)
  .post(protect, createLink);

router.route('/:id')
  .delete(protect, deleteLink);

export default router;
