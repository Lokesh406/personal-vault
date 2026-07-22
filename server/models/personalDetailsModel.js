import mongoose from 'mongoose';

const personalDetailsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    photo: { type: String }, // URL to image
    aboutMe: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    college: { type: String },
    degree: { type: String },
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        startDate: String,
        endDate: String,
        description: String,
      }
    ],
    languages: [String],
    achievements: [String],
  },
  {
    timestamps: true,
  }
);

const PersonalDetails = mongoose.model('PersonalDetails', personalDetailsSchema);
export default PersonalDetails;
