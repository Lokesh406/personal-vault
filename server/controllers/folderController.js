import Folder from '../models/folderModel.js';
import Document from '../models/documentModel.js';
import Note from '../models/noteModel.js';
import Project from '../models/projectModel.js';
import Link from '../models/linkModel.js';

// @desc    Get all folders
// @route   GET /api/folders
// @access  Private
export const getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // We want to count items inside the folder. We can do this on the fly or let the frontend handle it.
    // Let's do it on the fly for documents right now
    const folderData = await Promise.all(folders.map(async (folder) => {
      const docCount = await Document.countDocuments({ folder: folder._id });
      // Depending on if notes/projects support folders, we'd add them here.
      return { ...folder._doc, itemCount: docCount };
    }));

    res.json(folderData);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a folder
// @route   POST /api/folders
// @access  Private
export const createFolder = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const folder = new Folder({
      name,
      description,
      user: req.user._id,
    });

    const createdFolder = await folder.save();
    res.status(201).json({ ...createdFolder._doc, itemCount: 0 });
  } catch (error) {
    next(error);
  }
};

// @desc    Get folder details and its contents
// @route   GET /api/folders/:id
// @access  Private
export const getFolderContents = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);
    
    if (!folder || folder.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Folder not found');
    }

    // Get documents that belong to this folder
    const documents = await Document.find({ folder: folder._id }).sort({ createdAt: -1 });

    res.json({
      folder,
      documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
export const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (folder && folder.user.toString() === req.user._id.toString()) {
      // NOTE: We should probably move documents out of this folder or delete them.
      // For now, we'll just untie them from the folder
      await Document.updateMany({ folder: folder._id }, { $set: { folder: null } });

      await Folder.deleteOne({ _id: folder._id });
      res.json({ message: 'Folder removed' });
    } else {
      res.status(404);
      throw new Error('Folder not found');
    }
  } catch (error) {
    next(error);
  }
};
