import mongoose from 'mongoose';

const linkSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, default: 'General' },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model('Link', linkSchema);
export default Link;
