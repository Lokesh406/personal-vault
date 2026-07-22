import express from 'express';
import { getFolders, createFolder, getFolderContents, deleteFolder } from '../controllers/folderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFolders)
  .post(protect, createFolder);

router.route('/:id')
  .get(protect, getFolderContents)
  .delete(protect, deleteFolder);

export default router;
