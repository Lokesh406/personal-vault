import Document from '../models/documentModel.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id });
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const { title, category, folder } = req.body;

    const document = new Document({
      user: req.user._id,
      title: title || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      category: category || 'Document',
      folder: folder || null,
    });

    const createdDocument = await document.save();
    res.status(201).json(createdDocument);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (document && document.user.toString() === req.user._id.toString()) {
      if (document.filename) {
        try {
          await cloudinary.uploader.destroy(document.filename);
        } catch (err) {
          console.error('Error deleting from Cloudinary', err);
        }
      }

      await Document.deleteOne({ _id: document._id });
      res.json({ message: 'Document removed' });
    } else {
      res.status(404);
      throw new Error('Document not found or unauthorized');
    }
  } catch (error) {
    next(error);
  }
};
