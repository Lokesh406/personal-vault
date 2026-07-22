import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Note from '../models/noteModel.js';
import Project from '../models/projectModel.js';
import Document from '../models/documentModel.js';
import Link from '../models/linkModel.js';

const router = express.Router();

// @desc    Global search across all modules
// @route   GET /api/search
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ notes: [], projects: [], documents: [], links: [] });
    }

    const regex = new RegExp(query, 'i'); // case-insensitive regex
    const user = req.user._id;

    // Run searches in parallel
    const [notes, projects, documents, links] = await Promise.all([
      Note.find({ user, $or: [{ title: regex }, { content: regex }, { category: regex }] }),
      Project.find({ user, $or: [{ title: regex }, { description: regex }, { technologies: regex }] }),
      Document.find({ user, $or: [{ title: regex }, { originalName: regex }, { category: regex }] }),
      Link.find({ user, $or: [{ title: regex }, { url: regex }] })
    ]);

    res.json({
      notes,
      projects,
      documents,
      links,
      total: notes.length + projects.length + documents.length + links.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
