import authService from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user = await authService.addFavorite(req.user._id, propertyId);
    res.status(200).json({
      success: true,
      message: 'Property added to favorites',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await authService.removeFavorite(req.user._id, propertyId);
    res.status(200).json({
      success: true,
      message: 'Property removed from favorites',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const favorites = await authService.getFavorites(req.user._id);
    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};