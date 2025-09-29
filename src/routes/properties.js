import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateProperty, handleValidationErrors } from '../middleware/validation.js';
import upload from '../middleware/upload.js';
import * as propertyController from '../controllers/propertyController.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

router.get('/', propertyController.getProperties);
router.get('/search', propertyController.searchProperties);
router.get('/agent/:agentId', propertyController.getAgentProperties);
router.get('/:id', propertyController.getPropertyById);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  upload.array('images', 5),
  async (req, res, next) => {
    try {
      // If files are uploaded, process them with Cloudinary
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Upload timeout - Cloudinary upload took too long'));
            }, 30000);

            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'properties',
                resource_type: 'image',
                timeout: 60000,
              },
              (error, result) => {
                clearTimeout(timeout);
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            uploadStream.end(file.buffer);
          });
        });

        const imageUrls = await Promise.all(uploadPromises);
        req.body.images = imageUrls;
      }

      // Parse JSON fields if they come as strings from FormData
      if (typeof req.body.price === 'string') req.body.price = parseFloat(req.body.price);
      if (typeof req.body.area === 'string') req.body.area = parseFloat(req.body.area);
      if (req.body.bedrooms === 'null' || req.body.bedrooms === '') req.body.bedrooms = null;
      else if (typeof req.body.bedrooms === 'string') req.body.bedrooms = parseInt(req.body.bedrooms);
      if (req.body.bathrooms === 'null' || req.body.bathrooms === '') req.body.bathrooms = null;
      else if (typeof req.body.bathrooms === 'string') req.body.bathrooms = parseInt(req.body.bathrooms);
      if (typeof req.body.features === 'string') {
        try {
          req.body.features = JSON.parse(req.body.features);
        } catch (e) {
          req.body.features = [];
        }
      }

      next();
    } catch (error) {
      console.error('Image upload error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images',
      });
    }
  },
  validateProperty,
  handleValidationErrors,
  propertyController.createProperty
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  validateProperty,
  handleValidationErrors,
  propertyController.updateProperty
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.deleteProperty
);

router.patch(
  '/:id/toggle-status',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.togglePropertyStatus
);

router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      if (req.files.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 images allowed' });
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Upload timeout - Cloudinary upload took too long'));
          }, 30000); // 30 second timeout per file

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'properties',
              resource_type: 'image',
              timeout: 60000,
            },
            (error, result) => {
              clearTimeout(timeout);
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const imageUrls = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: { images: imageUrls }
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      const errorMessage = error.message || 'Failed to upload images';
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;