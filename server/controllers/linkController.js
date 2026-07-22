import Link from '../models/linkModel.js';

// @desc    Get all links for a user
// @route   GET /api/links
// @access  Private
export const getLinks = async (req, res, next) => {
  try {
    const links = await Link.find({ user: req.user._id }).populate('folder', 'name');
    res.json(links);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a link
// @route   POST /api/links
// @access  Private
export const createLink = async (req, res, next) => {
  try {
    const { title, url, category, folder } = req.body;
    
    const link = new Link({
      user: req.user._id,
      title,
      url,
      category,
      folder: folder || null,
    });
    
    const createdLink = await link.save();
    res.status(201).json(createdLink);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a link
// @route   DELETE /api/links/:id
// @access  Private
export const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findById(req.params.id);
    
    if (link && link.user.toString() === req.user._id.toString()) {
      await Link.deleteOne({ _id: link._id });
      res.json({ message: 'Link removed' });
    } else {
      res.status(404);
      throw new Error('Link not found or unauthorized');
    }
  } catch (error) {
    next(error);
  }
};
