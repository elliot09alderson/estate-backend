import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import propertyRequirementRoutes from "./routes/propertyRequirements.js";
import tourRoutes from "./routes/tourRoutes.js";
import messageRoutes from "./routes/messages.js";
import ratingRoutes from "./routes/ratings.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for deployed environments (Render, Heroku, etc.)
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increased for mobile uploads
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for file uploads to prevent mobile issues
    return req.path.includes('/upload') || req.path.includes('/properties');
  }
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Enhanced CORS configuration with debugging
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8080",
  "http://localhost:5173",
  "https://crimsonbricks.com",
  "https://estate-frontend-delta.vercel.app",
  "https://estate-frontend-vxn5.vercel.app",
  "https://ontend-vxn5.vercel.app",  // Correct frontend domain
  "https://estate-backend-th8i.onrender.com",
];

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('🔍 CORS request from origin:', origin);
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS allowed for:', origin);
        return callback(null, true);
      } else {
        console.log('❌ CORS rejected for:', origin);
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(limiter);
app.use(morgan("combined"));
app.use(cookieParser());

// Increased limits for mobile image uploads
app.use(express.json({
  limit: "50mb",
  parameterLimit: 50000,
  timeout: 300000 // 5 minutes timeout for uploads
}));
app.use(express.urlencoded({
  extended: true,
  limit: "50mb",
  parameterLimit: 50000
}));

// Static files for uploaded images
app.use("/uploads", express.static("uploads"));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "estate" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/property-requirements", propertyRequirementRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ratings", ratingRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toUTCString() });
});

// Test upload endpoint
app.post("/api/test-upload", (req, res) => {
  console.log("=== TEST UPLOAD REQUEST ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  console.log("========================");
  res.json({ success: true, message: "Test upload endpoint reached" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Multer error handler for file uploads
app.use((err, req, res, next) => {
  // Log detailed error information
  console.error('=== SERVER ERROR ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('URL:', req?.url || 'Unknown URL');
  console.error('Method:', req?.method || 'Unknown Method');
  console.error('User Agent:', req?.get('User-Agent') || 'Unknown User Agent');
  console.error('Error Code:', err.code || 'No Code');
  console.error('Error Message:', err.message || 'No Message');
  console.error('Error Stack:', err.stack || 'No Stack Trace');
  console.error('==================');

  if (err.code === 'LIMIT_FILE_SIZE') {
    console.log('File size limit exceeded - sending client error');
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum file size is 20MB per image.',
      error: 'LIMIT_FILE_SIZE'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    console.log('File count limit exceeded - sending client error');
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 10 images allowed.',
      error: 'LIMIT_FILE_COUNT'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    console.log('Unexpected file field - sending client error');
    return res.status(400).json({
      success: false,
      message: 'Unexpected field in form data.',
      error: 'LIMIT_UNEXPECTED_FILE'
    });
  }

  if (err.message && err.message.includes('Only image files are allowed')) {
    console.log('Invalid file type - sending client error');
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed (jpeg, jpg, png, gif, webp).',
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Cloudinary errors
  if (err.message && err.message.includes('Cloudinary')) {
    console.log('Cloudinary upload error - sending client error');
    return res.status(500).json({
      success: false,
      message: 'Image upload service error. Please try again.',
      error: 'CLOUDINARY_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Network/timeout errors
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    console.log('Network/timeout error - sending client error');
    return res.status(408).json({
      success: false,
      message: 'Upload timeout. Please check your connection and try again.',
      error: 'NETWORK_TIMEOUT'
    });
  }

  // MongoDB/Database errors
  if (err.name === 'ValidationError') {
    console.log('Database validation error - sending client error');
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided. Please check all required fields.',
      error: 'VALIDATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // General error handler
  console.log('Unhandled error - sending generic error response');
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong! Please try again.",
    error: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
