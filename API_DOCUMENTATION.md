# Estate Management API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All authenticated endpoints require either:

- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Cookie**: `token=<JWT_TOKEN>` (httpOnly, secure in production)

---

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [Property Routes](#property-routes)
3. [Admin Routes](#admin-routes)
4. [Feedback Routes](#feedback-routes)
5. [Data Models](#data-models)
6. [Error Responses](#error-responses)

---

## Authentication Routes

### 1. Register User/Agent

**POST** `/auth/register`

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "name": "string (required, max 50 chars)",
  "phone": "string (optional, valid phone number)",
  "role": "string (optional, enum: ['user', 'agent'], default: ' vb')",
  "licenseNumber": "string (required if role=agent, unique)",
  "companyName": "string (optional, only for agents)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "name": "string",
      "phone": "string",
      "avatar": "string | null",
      "role": "string (enum: ['user', 'agent', 'admin'])",
      "isActive": "boolean",
      "favorites": ["string (propertyId)"],
      "licenseNumber": "string (only for agents)",
      "companyName": "string (only for agents)",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    },
    "token": "string (JWT token)"
  }
}
```

---

### 2. Login

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      /* same as register response */
    },
    "token": "string (JWT token)"
  }
}
```

---

### 3. Logout

**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Get Profile

**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    /* user object */
  }
}
```

---

### 5. Update Profile

**PUT** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "string (optional, max 50 chars)",
  "phone": "string (optional, valid phone)",
  "avatar": "string (optional, URL)",
  "companyName": "string (optional, agents only)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    /* updated user object */
  }
}
```

---

### 6. Change Password

**PUT** `/auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 chars)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### 7. Add to Favorites

**POST** `/auth/favorites`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "propertyId": "string (required, valid MongoDB ObjectId)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Property added to favorites",
  "data": {
    /* updated user object */
  }
}
```

---

### 8. Remove from Favorites

**DELETE** `/auth/favorites/:propertyId`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Property removed from favorites",
  "data": {
    /* updated user object */
  }
}
```

---

### 9. Get Favorites

**GET** `/auth/favorites`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    /* array of property objects */
  ]
}
```

---

## Property Routes

### 1. Get All Properties (Public)

**GET** `/properties`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
category: string (optional, enum: ['flat', 'land', 'shop', 'house'])
listingType: string (optional, enum: ['sale', 'rent'])
minPrice: number (optional)
maxPrice: number (optional)
location: string (optional, case-insensitive search)
minArea: number (optional)
maxArea: number (optional)
bedrooms: number (optional, minimum bedrooms)
bathrooms: number (optional, minimum bathrooms)
sortBy: string (optional, enum: ['price_asc', 'price_desc', 'newest', 'oldest'])
```

**Response:**

```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "price": "number",
        "category": "string (enum: ['flat', 'land', 'shop', 'house'])",
        "listingType": "string (enum: ['sale', 'rent'])",
        "area": "number",
        "bedrooms": "number | null",
        "bathrooms": "number | null",
        "location": "string",
        "address": "string",
        "images": ["string (URLs)"],
        "agentId": {
          "_id": "string",
          "name": "string",
          "email": "string",
          "phone": "string",
          "avatar": "string"
        },
        "agentName": "string",
        "agentPhone": "string",
        "features": ["string"],
        "isActive": "boolean",
        "isApproved": "string (enum: ['pending', 'approved', 'rejected'])",
        "rejectionReason": "string | null",
        "isFeatured": "boolean",
        "views": "number",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 2. Search Properties

**GET** `/properties/search`

**Query Parameters:**

```
q: string (required, search term)
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:** Same as Get All Properties

---

### 3. Get Property by ID (Public)

**GET** `/properties/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    /* single property object with populated agent info */
  }
}
```

---

### 4. Get Properties by Agent

**GET** `/properties/agent/:agentId`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:** Same as Get All Properties

---

### 5. Create Property (Agent/Admin only)

**POST** `/properties`

**Headers:** `Authorization: Bearer <token>`

**Roles:** `agent`, `admin`

**Request Body:**

```json
{
  "title": "string (required, max 100 chars)",
  "description": "string (required, max 2000 chars)",
  "price": "number (required, >= 0)",
  "category": "string (required, enum: ['flat', 'land', 'shop', 'house'])",
  "listingType": "string (required, enum: ['sale', 'rent'])",
  "area": "number (required, >= 1)",
  "bedrooms": "number (optional, >= 0)",
  "bathrooms": "number (optional, >= 0)",
  "location": "string (required, max 100 chars)",
  "address": "string (required, max 200 chars)",
  "images": ["string (required, array of URLs)"],
  "features": ["string (optional, max 50 chars each)"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Property created successfully and pending approval",
  "data": {
    /* property object with isApproved: 'pending' */
  }
}
```

---

### 6. Update Property (Agent/Admin)

**PUT** `/properties/:id`

**Headers:** `Authorization: Bearer <token>`

**Roles:** `agent` (own properties only), `admin` (all properties)

**Request Body:** Same as Create Property (all fields optional)

**Response:**

```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    /* updated property object */
  }
}
```

---

### 7. Delete Property (Agent/Admin)

**DELETE** `/properties/:id`

**Headers:** `Authorization: Bearer <token>`

**Roles:** `agent` (own properties only), `admin` (all properties)

**Response:**

```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### 8. Toggle Property Status (Agent/Admin)

**PATCH** `/properties/:id/toggle-status`

**Headers:** `Authorization: Bearer <token>`

**Roles:** `agent` (own properties only), `admin` (all properties)

**Response:**

```json
{
  "success": true,
  "message": "Property activated/deactivated successfully",
  "data": {
    /* updated property object */
  }
}
```

---

### 9. Upload Property Images (Agent/Admin)

**POST** `/properties/upload`

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Roles:** `agent`, `admin`

**Request Body:**

```
images: File[] (required, max 10 images)
```

**Response:**

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": [
    "/uploads/properties/filename1.jpg",
    "/uploads/properties/filename2.jpg"
  ]
}
```

---

## Admin Routes

**Note:** All admin routes require `admin` role

### 1. Get Dashboard Stats

**GET** `/admin/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": "number",
      "agents": "number",
      "regularUsers": "number"
    },
    "properties": {
      "total": "number",
      "pending": "number",
      "approved": "number",
      "rejected": "number"
    },
    "feedbacks": {
      "total": "number",
      "pending": "number"
    }
  }
}
```

---

### 2. Get All Properties (Admin View)

**GET** `/admin/properties`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
isApproved: string (optional, enum: ['pending', 'approved', 'rejected'])
category: string (optional, enum: ['flat', 'land', 'shop', 'house'])
listingType: string (optional, enum: ['sale', 'rent'])
```

**Response:**

```json
{
  "success": true,
  "data": {
    "properties": [
      /* array of all properties */
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 3. Get Pending Properties

**GET** `/admin/properties/pending`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:** Same as Get All Properties (Admin View)

---

### 4. Approve Property

**PUT** `/admin/properties/:id/approve`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Property approved successfully",
  "data": {
    /* property with isApproved: 'approved' */
  }
}
```

---

### 5. Reject Property

**PUT** `/admin/properties/:id/reject`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "reason": "string (required, rejection reason)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Property rejected successfully",
  "data": {
    /* property with isApproved: 'rejected' and rejectionReason */
  }
}
```

---

### 6. Delete Property (Admin)

**DELETE** `/admin/properties/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### 7. Get All Users

**GET** `/admin/users`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
role: string (optional, enum: ['user', 'agent', 'admin'])
isActive: boolean (optional)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      /* array of user objects */
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 8. Get All Agents

**GET** `/admin/agents`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
isActive: boolean (optional)
```

**Response:** Same as Get All Users

---

### 9. Deactivate Agent

**PUT** `/admin/agents/:id/deactivate`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Agent deactivated successfully",
  "data": {
    /* user with isActive: false */
  }
}
```

---

### 10. Activate Agent

**PUT** `/admin/agents/:id/activate`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Agent activated successfully",
  "data": {
    /* user with isActive: true */
  }
}
```

---

### 11. Block User

**PUT** `/admin/users/:id/block`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    /* user with isActive: false */
  }
}
```

---

### 12. Unblock User

**PUT** `/admin/users/:id/unblock`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": {
    /* user with isActive: true */
  }
}
```

---

### 13. Delete User

**DELETE** `/admin/users/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 14. Get All Feedbacks

**GET** `/admin/feedbacks`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "_id": "string",
        "userId": {
          "_id": "string",
          "name": "string",
          "email": "string",
          "avatar": "string"
        },
        "userName": "string",
        "userEmail": "string",
        "propertyId": {
          "_id": "string",
          "title": "string"
        } | null,
        "subject": "string",
        "message": "string",
        "rating": "number (1-5) | null",
        "status": "string (enum: ['pending', 'reviewed', 'resolved'])",
        "adminResponse": "string | null",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 15. Get Feedbacks by Status

**GET** `/admin/feedbacks/status/:status`

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**

```
status: string (required, enum: ['pending', 'reviewed', 'resolved'])
```

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:** Same as Get All Feedbacks

---

### 16. Respond to Feedback

**PUT** `/admin/feedbacks/:id/respond`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "adminResponse": "string (required, admin's response)",
  "status": "string (optional, enum: ['reviewed', 'resolved'], default: 'reviewed')"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response sent successfully",
  "data": {
    /* updated feedback object */
  }
}
```

---

### 17. Get Activities

**GET** `/admin/activities`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 20)
action: string (optional, enum: ['approved_property', 'rejected_property', 'deleted_property', 'deactivated_agent', 'activated_agent', 'blocked_user', 'unblocked_user', 'deleted_user', 'updated_property', 'responded_feedback'])
targetType: string (optional, enum: ['user', 'property', 'feedback'])
```

**Response:**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "string",
        "adminId": {
          "_id": "string",
          "name": "string",
          "email": "string",
          "avatar": "string"
        },
        "adminName": "string",
        "action": "string",
        "targetType": "string",
        "targetId": "string",
        "targetName": "string",
        "description": "string",
        "metadata": "object",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 18. Get Recent Activities

**GET** `/admin/activities/recent`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
limit: number (optional, default: 10)
```

**Response:**

```json
{
  "success": true,
  "data": [
    /* array of recent activity objects */
  ]
}
```

---

## Feedback Routes

### 1. Create Feedback

**POST** `/feedbacks`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "propertyId": "string (optional, MongoDB ObjectId)",
  "subject": "string (required, max 200 chars)",
  "message": "string (required, max 1000 chars)",
  "rating": "number (optional, 1-5)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    /* feedback object */
  }
}
```

---

### 2. Get My Feedbacks

**GET** `/feedbacks/my-feedbacks`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbacks": [
      /* array of feedback objects */
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 3. Get Feedback by ID

**GET** `/feedbacks/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    /* feedback object */
  }
}
```

---

### 4. Get Property Feedbacks (Public)

**GET** `/feedbacks/property/:propertyId`

**Query Parameters:**

```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbacks": [
      /* array of feedback objects */
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
}
```

---

### 5. Get Property Average Rating (Public)

**GET** `/feedbacks/property/:propertyId/rating`

**Response:**

```json
{
  "success": true,
  "data": {
    "avgRating": "number (0-5)",
    "count": "number (total ratings)"
  }
}
```

---

### 6. Update Feedback

**PUT** `/feedbacks/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "subject": "string (optional, max 200 chars)",
  "message": "string (optional, max 1000 chars)",
  "rating": "number (optional, 1-5)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "data": {
    /* updated feedback object */
  }
}
```

---

### 7. Delete Feedback

**DELETE** `/feedbacks/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

---

## Data Models

### User Schema

```typescript
{
  _id: ObjectId
  email: string (unique, required)
  password: string (required, hashed with bcrypt)
  name: string (required, max 50 chars)
  phone: string (optional, valid phone)
  avatar: string | null (URL)
  role: 'user' | 'agent' | 'admin' (default: 'user')
  isActive: boolean (default: true)
  favorites: ObjectId[] (references Property)
  licenseNumber: string (unique, required for agents)
  companyName: string (optional, for agents)
  createdAt: Date
  updatedAt: Date
}
```

---

### Property Schema

```typescript
{
  _id: ObjectId
  title: string (required, max 100 chars)
  description: string (required, max 2000 chars)
  price: number (required, >= 0)
  category: 'flat' | 'land' | 'shop' | 'house' (required)
  listingType: 'sale' | 'rent' (required)
  area: number (required, >= 1)
  bedrooms: number | null (>= 0)
  bathrooms: number | null (>= 0)
  location: string (required, max 100 chars)
  address: string (required, max 200 chars)
  images: string[] (required, URLs)
  agentId: ObjectId (required, references User)
  agentName: string (required)
  agentPhone: string (required)
  features: string[] (optional, max 50 chars each)
  isActive: boolean (default: true)
  isApproved: 'pending' | 'approved' | 'rejected' (default: 'pending')
  rejectionReason: string | null
  isFeatured: boolean (default: false)
  views: number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

---

### Feedback Schema

```typescript
{
  _id: ObjectId
  userId: ObjectId (required, references User)
  userName: string (required)
  userEmail: string (required)
  propertyId: ObjectId | null (references Property)
  subject: string (required, max 200 chars)
  message: string (required, max 1000 chars)
  rating: number | null (1-5)
  status: 'pending' | 'reviewed' | 'resolved' (default: 'pending')
  adminResponse: string | null
  createdAt: Date
  updatedAt: Date
}
```

---

### Activity Schema

```typescript
{
  _id: ObjectId
  adminId: ObjectId (required, references User)
  adminName: string (required)
  action: 'approved_property' | 'rejected_property' | 'deleted_property' |
          'deactivated_agent' | 'activated_agent' | 'blocked_user' |
          'unblocked_user' | 'deleted_user' | 'updated_property' |
          'responded_feedback' (required)
  targetType: 'user' | 'property' | 'feedback' (required)
  targetId: ObjectId (required)
  targetName: string
  description: string (required)
  metadata: object (default: {})
  createdAt: Date
  updatedAt: Date
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    /* validation errors array (if validation failed) */
  ]
}
```

### 401 Unauthorized

```json
{
  "message": "Access token is required"
}
```

or

```json
{
  "message": "Invalid token"
}
```

or

```json
{
  "message": "Token has expired"
}
```

### 403 Forbidden

```json
{
  "message": "Access denied. Required roles: admin"
}
```

or

```json
{
  "message": "Account is deactivated"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Something went wrong!"
}
```

---

## Enums Reference

### User Roles

```
'user' | 'agent' | 'admin'
```

### Property Categories

```
'flat' | 'land' | 'shop' | 'house'
```

### Listing Types

```
'sale' | 'rent'
```

### Property Approval Status

```
'pending' | 'approved' | 'rejected'
```

### Feedback Status

```
'pending' | 'reviewed' | 'resolved'
```

### Activity Actions

```
'approved_property'
'rejected_property'
'deleted_property'
'deactivated_agent'
'activated_agent'
'blocked_user'
'unblocked_user'
'deleted_user'
'updated_property'
'responded_feedback'
```

### Activity Target Types

```
'user' | 'property' | 'feedback'
```

### Sort Options (for properties)

```
'price_asc' | 'price_desc' | 'newest' | 'oldest'
```

---

## Feature List

### Authentication & Authorization

- ✅ User/Agent registration with role selection
- ✅ Login with JWT tokens (stored in httpOnly cookies)
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Role-based access control (user, agent, admin)
- ✅ Profile management
- ✅ Password change functionality
- ✅ Logout with cookie clearing

### Property Management

- ✅ Create, read, update, delete properties (agents)
- ✅ Four property categories: flat, land, shop, house
- ✅ Two listing types: sale, rent
- ✅ Property approval workflow (pending → approved/rejected)
- ✅ Multi-image upload support
- ✅ Advanced filtering (price, location, area, bedrooms, bathrooms)
- ✅ Text search across title, description, location
- ✅ Sorting (price, date)
- ✅ Pagination
- ✅ View tracking
- ✅ Featured properties
- ✅ Favorites system

### Agent Features

- ✅ License number validation
- ✅ Company name support
- ✅ Property listings management
- ✅ View property statistics

### Admin Panel

- ✅ Dashboard with comprehensive statistics
- ✅ Approve/reject property submissions
- ✅ Delete properties
- ✅ View all users with filtering
- ✅ Deactivate/activate agents
- ✅ Block/unblock users
- ✅ Delete users
- ✅ View and respond to feedbacks
- ✅ Activity logging for all admin actions
- ✅ Recent activities feed

### Feedback System

- ✅ Submit feedback (with optional property reference)
- ✅ Rating system (1-5 stars)
- ✅ Admin responses
- ✅ Status tracking (pending/reviewed/resolved)
- ✅ Property-specific feedback
- ✅ Average rating calculation

### Security Features

- ✅ Helmet.js with Content Security Policy
- ✅ CORS with credentials support
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ httpOnly secure cookies
- ✅ Input validation with express-validator
- ✅ JWT expiration (7 days)
- ✅ Account deactivation checks

---

## Notes for Frontend Integration

1. **Token Storage**: The API sets JWT tokens in httpOnly cookies automatically. You can also use the token from the response for Authorization header.

2. **File Upload**: Use `FormData` for image uploads to `/properties/upload` endpoint.

3. **Pagination**: All list endpoints support pagination with `page` and `limit` query parameters.

4. **Date Format**: All dates are returned in ISO 8601 format.

5. **ObjectId**: MongoDB ObjectIds are 24-character hexadecimal strings.

6. **Error Handling**: Always check the `success` field in responses. Errors include a `message` field.

7. **Agent Phone**: When creating properties, `agentPhone` is auto-filled from the agent's profile if not provided.

8. **Property Visibility**: Only approved and active properties are visible to regular users.

---

## Contact

For issues or questions, please refer to the backend repository.
