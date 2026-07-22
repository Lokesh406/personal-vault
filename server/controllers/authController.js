import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Verify secret code
// @route   POST /api/auth/verify-code
// @access  Public
export const verifySecretCode = (req, res) => {
  const { code } = req.body;
  if (code === process.env.SECRET_CODE) {
    res.json({ success: true, message: 'Code verified' });
  } else {
    res.status(401);
    throw new Error('Invalid Secret Code');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create admin user (one-time setup)
// @route   POST /api/auth/setup
// @access  Public
export const setupAdmin = async (req, res, next) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const { name, email, password, code } = req.body;

    if (code !== process.env.SECRET_CODE) {
      res.status(401);
      throw new Error('Invalid Secret Code');
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: true,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};
