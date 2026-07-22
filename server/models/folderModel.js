import mongoose from 'mongoose';

const folderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null, // Null means it's a root folder
    },
    // To specify if this folder is for a specific module (e.g., 'Documents', 'Images') or general 'All'
    moduleType: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

const Folder = mongoose.model('Folder', folderSchema);
export default Folder;
