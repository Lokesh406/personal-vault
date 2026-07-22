import PersonalDetails from '../models/personalDetailsModel.js';

// @desc    Get personal details
// @route   GET /api/personal-details
// @access  Private
export const getPersonalDetails = async (req, res, next) => {
  try {
    const details = await PersonalDetails.findOne({ user: req.user._id });
    if (details) {
      res.json(details);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update or create personal details
// @route   POST /api/personal-details
// @access  Private
export const updatePersonalDetails = async (req, res, next) => {
  try {
    let details = await PersonalDetails.findOne({ user: req.user._id });

    if (details) {
      // Update
      details.name = req.body.name || details.name;
      details.aboutMe = req.body.aboutMe || details.aboutMe;
      details.phone = req.body.phone || details.phone;
      details.email = req.body.email || details.email;
      details.address = req.body.address || details.address;
      details.college = req.body.college || details.college;
      details.degree = req.body.degree || details.degree;
      details.skills = req.body.skills || details.skills;
      details.experience = req.body.experience || details.experience;
      details.languages = req.body.languages || details.languages;
      details.achievements = req.body.achievements || details.achievements;
      
      const updatedDetails = await details.save();
      res.json(updatedDetails);
    } else {
      // Create
      const newDetails = new PersonalDetails({
        user: req.user._id,
        ...req.body,
      });
      const createdDetails = await newDetails.save();
      res.status(201).json(createdDetails);
    }
  } catch (error) {
    next(error);
  }
};
