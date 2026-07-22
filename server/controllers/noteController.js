import Note from '../models/noteModel.js';

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id }).populate('folder', 'name');
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res, next) => {
  try {
    const { title, content, category, folder } = req.body;
    
    const note = new Note({
      user: req.user._id,
      title,
      content,
      category,
      folder: folder || null,
    });
    
    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (note && note.user.toString() === req.user._id.toString()) {
      note.title = req.body.title || note.title;
      note.content = req.body.content || note.content;
      note.category = req.body.category || note.category;
      note.folder = req.body.folder || note.folder;
      
      const updatedNote = await note.save();
      res.json(updatedNote);
    } else {
      res.status(404);
      throw new Error('Note not found or unauthorized');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (note && note.user.toString() === req.user._id.toString()) {
      await Note.deleteOne({ _id: note._id });
      res.json({ message: 'Note removed' });
    } else {
      res.status(404);
      throw new Error('Note not found or unauthorized');
    }
  } catch (error) {
    next(error);
  }
};
