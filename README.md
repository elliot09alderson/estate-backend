# Real Estate Backend API

A comprehensive backend API for a real estate application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Agent, Admin)
  - Password hashing with bcrypt
  - User registration and login

- **Property Management**
  - CRUD operations for properties
  - Advanced filtering and search
  - Image upload functionality
  - Property categorization (flat, farming-land, house-shop, plot)
  - Property types (sale, rent)

- **User Features**
  - User profiles management
  - Favorites system
  - Agent property listings

- **Admin Dashboard**
  - User management (activate/deactivate)
  - Property management
  - Analytics and statistics
  - Featured property management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/realestate
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Start MongoDB service on your system

5. Run the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user/agent | No |
| POST | `/login` | Login user | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/favorites` | Toggle property favorite | Yes |
| GET | `/favorites` | Get user favorites | Yes |

### Property Routes (`/api/properties`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all properties (with filtering) | No |
| GET | `/:id` | Get single property | No |
| POST | `/` | Create property | Yes (Agent/Admin) |
| PUT | `/:id` | Update property | Yes (Owner/Admin) |
| DELETE | `/:id` | Delete property | Yes (Owner/Admin) |
| POST | `/upload` | Upload property images | Yes (Agent/Admin) |
| GET | `/agent/:agentId` | Get properties by agent | No |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes (Admin) |
| PUT | `/users/:userId/toggle-status` | Toggle user status | Yes (Admin) |
| GET | `/properties` | Get all properties | Yes (Admin) |
| PUT | `/properties/:propertyId/toggle-status` | Toggle property status | Yes (Admin) |
| PUT | `/properties/:propertyId/toggle-featured` | Toggle featured status | Yes (Admin) |
| GET | `/analytics` | Get dashboard analytics | Yes (Admin) |
| DELETE | `/users/:userId` | Delete user | Yes (Admin) |
| DELETE | `/properties/:propertyId` | Delete property | Yes (Admin) |

## Request Examples

### Register User
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user"
}
```

### Register Agent
```bash
POST /api/auth/register
{
  "name": "Jane Agent",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "agent",
  "licenseNumber": "AGT001",
  "companyName": "Real Estate Co."
}
```

### Create Property
```bash
POST /api/properties
Authorization: Bearer <token>
{
  "title": "Beautiful 3BR Apartment",
  "description": "Modern apartment with great views",
  "price": 250000,
  "category": "flat",
  "type": "sale",
  "area": 1200,
  "bedrooms": 3,
  "bathrooms": 2,
  "location": "Downtown",
  "address": "123 Main St",
  "images": ["/uploads/properties/image1.jpg"],
  "agentPhone": "+1234567890",
  "features": ["parking", "balcony", "gym"]
}
```

### Search Properties
```bash
GET /api/properties?category=flat&type=sale&minPrice=100000&maxPrice=500000&location=downtown&page=1&limit=10
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## File Upload

Property images are uploaded to `/uploads/properties/` directory. Maximum file size is 5MB per image, with support for JPEG, JPG, PNG, GIF, and WebP formats.

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet for security headers
- CORS enabled
- Password hashing with bcrypt (salt rounds: 12)
- JWT token expiration
- Input validation and sanitization

## Database Schema

### User Schema
- email (unique)
- password (hashed)
- name
- phone
- avatar
- role (user, agent, admin)
- isActive
- favorites (array of property IDs)
- licenseNumber (for agents)
- companyName (for agents)

### Property Schema
- title
- description
- price
- category (flat, farming-land, house-shop, plot)
- type (sale, rent)
- area
- bedrooms
- bathrooms
- location
- address
- images (array)
- agentId (reference to User)
- agentName
- agentPhone
- features (array)
- isActive
- isFeatured
- views

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/realestate |
| JWT_SECRET | JWT secret key | Required |
| JWT_EXPIRES_IN | JWT token expiration | 7d |
| NODE_ENV | Environment | development |

## Development

```bash
npm run dev  # Start with nodemon for auto-restart
```

## Production Deployment

1. Set NODE_ENV=production
2. Use a secure JWT_SECRET
3. Configure MongoDB URI for production
4. Set up reverse proxy (nginx)
5. Use PM2 for process management

```bash
npm install -g pm2
pm2 start src/index.js --name "realestate-api"
```