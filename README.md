# Property Management API Documentation
A comprehensive RESTful API for managing properties with image uploads. Users can register, login, create properties with images, search properties, and get recommendations.

## Deploye link :- https://dashboard.render.com/web/srv-d3c320b7mgec73a6c420/deploys/dep-d3c320j7mgec73a6c4hg

## Introduction
The Property Management API is a RESTful service that allows users to manage properties with image uploads. Users can register, login, create properties with images, search properties, and get recommendations.


##Features
```
1. User Authentication: Secure registration, login, and logout with JWT tokens
2. Property Management: Full CRUD operations for properties
3. Image Upload: Upload up to 4 images per property with local storage
4. Advanced Search: Search properties with multiple filters (location, price, BHK, status, etc.)
5. Recommendations: Get property recommendations based on similar properties
6. Pagination: Efficient pagination for property listings
7. Caching: In-memory caching for improved performance

```

## Base URL
```
http://localhost:5000/api
```

## Installation
1. Clone the repository  
2. Install dependencies: `npm install`  
3. Set up environment variables in a `.env` file  
4. Start the server: `nodemon server.js`  


## .env setup
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket

```
## Authentication
All protected endpoints require a JWT token in the `x-auth-token` header:
```
x-auth-token: <JWT_TOKEN>
```

---

## API Endpoints

### 1. User Registration
**Endpoint:** `POST /auth/register`  

**Request:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Response (201):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "638d1f7a9e8b9a0b1c8d4e5f",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2022-12-05T10:30:18.123Z"
    }
}
```

---

### 2. User Login
**Endpoint:** `POST /auth/login`  

**Request:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "638d1f7a9e8b9a0b1c8d4e5f",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2022-12-05T10:30:18.123Z"
    }
}
```

---

### 3. Create Property (Without Images)
**Endpoint:** `POST /properties`  

**Request:**
```json
{
    "title": "Luxury Apartment in Gurgaon",
    "location": "Gurgaon",
    "price": 15000000,
    "bhk": 3,
    "type": "Apartment",
    "description": "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
    "status": "sale",
    "images": []
}
```

**Response (201):**
```json
{
    "_id": "638d2a1b9e8b9a0b1c8d4e6a",
    "title": "Luxury Apartment in Gurgaon",
    "location": "Gurgaon",
    "price": 15000000,
    "bhk": 3,
    "type": "Apartment",
    "description": "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
    "status": "sale",
    "images": [],
    "date": "2022-12-05T11:15:23.456Z",
    "owner": "638d1f7a9e8b9a0b1c8d4e5f"
}
```

---

### 4. Create Property with Images (Single Request)
**Endpoint:** `POST /properties-with-images`  

**Request:** (multipart/form-data)  
- title: "Modern Villa in Mumbai"  
- location: "Mumbai"  
- price: "35000000"  
- bhk: "5"  
- type: "Villa"  
- description: "A modern 5BHK villa with a private pool and stunning city views."  
- status: "sale"  
- images: [select up to 4 image files]  

**Response (201):**
```json
{
    "_id": "638d2b3c9e8b9a0b1c8d4e6b",
    "title": "Modern Villa in Mumbai",
    "location": "Mumbai",
    "price": 35000000,
    "bhk": 5,
    "type": "Villa",
    "description": "A modern 5BHK villa with a private pool and stunning city views.",
    "status": "sale",
    "images": [
        "http://localhost:5000/uploads/1670235123456-image1.jpg",
        "http://localhost:5000/uploads/1670235123457-image2.jpg",
        "http://localhost:5000/uploads/1670235123458-image3.jpg"
    ],
    "date": "2022-12-05T11:20:12.789Z",
    "owner": "638d1f7a9e8b9a0b1c8d4e5f"
}
```

---

### 5. Upload Images
**Endpoint:** `POST /upload`  

**Request:** (multipart/form-data)  
- images: [select up to 4 image files]  

**Response (200):**
```json
{
    "msg": "Files uploaded successfully",
    "images": [
        "http://localhost:5000/uploads/1670234123456-image1.jpg",
        "http://localhost:5000/uploads/1670234123457-image2.jpg",
        "http://localhost:5000/uploads/1670234123458-image3.jpg"
    ]
}
```

---

### 6. Update Property Images
**Endpoint:** `PUT /properties/:id/images`  

**Request:**
```json
{
    "images": [
        "http://localhost:5000/uploads/1670234123456-image1.jpg",
        "http://localhost:5000/uploads/1670234123457-image2.jpg",
        "http://localhost:5000/uploads/1670234123458-image3.jpg"
    ]
}
```

**Response (200):**
```json
{
    "msg": "Property images updated successfully",
    "property": {
        "_id": "638d2a1b9e8b9a0b1c8d4e6a",
        "title": "Luxury Apartment in Gurgaon",
        "location": "Gurgaon",
        "price": 15000000,
        "bhk": 3,
        "type": "Apartment",
        "description": "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
        "status": "sale",
        "images": [
            "http://localhost:5000/uploads/1670234123456-image1.jpg",
            "http://localhost:5000/uploads/1670234123457-image2.jpg",
            "http://localhost:5000/uploads/1670234123458-image3.jpg"
        ],
        "date": "2022-12-05T11:15:23.456Z",
        "owner": "638d1f7a9e8b9a0b1c8d4e5f"
    }
}
```

---

### 7. Get All Properties
**Endpoint:** `GET /properties?page=1&limit=5`  

**Response (200):**
```json
{
    "properties": [
        {
            "_id": "638d2a1b9e8b9a0b1c8d4e6a",
            "title": "Luxury Apartment in Gurgaon",
            "location": "Gurgaon",
            "price": 15000000,
            "bhk": 3,
            "type": "Apartment",
            "description": "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
            "status": "sale",
            "images": [
                "http://localhost:5000/uploads/1670234123456-image1.jpg",
                "http://localhost:5000/uploads/1670234123457-image2.jpg",
                "http://localhost:5000/uploads/1670234123458-image3.jpg"
            ],
            "date": "2022-12-05T11:15:23.456Z",
            "owner": {
                "id": "638d1f7a9e8b9a0b1c8d4e5f",
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    ],
    "pagination": {
        "total": 25,
        "page": 1,
        "pages": 5
    }
}
```

---

### 8. Get Property by ID
**Endpoint:** `GET /properties/:id`  

**Response (200):**
```json
{
    "_id": "638d2a1b9e8b9a0b1c8d4e6a",
    "title": "Luxury Apartment in Gurgaon",
    "location": "Gurgaon",
    "price": 15000000,
    "bhk": 3,
    "type": "Apartment",
    "description": "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
    "status": "sale",
    "images": [
        "http://localhost:5000/uploads/1670234123456-image1.jpg",
        "http://localhost:5000/uploads/1670234123457-image2.jpg",
        "http://localhost:5000/uploads/1670234123458-image3.jpg"
    ],
    "date": "2022-12-05T11:15:23.456Z",
    "owner": {
        "id": "638d1f7a9e8b9a0b1c8d4e5f",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

---

### 9. Search Properties
**Endpoint:** `GET /search?bhk=3&location=Gurgaon`  

**Response (200):**
```json
[
    {
        "_id": "638d2a1b9e8b9a0b1c8d4e6a",
        "title": "Luxury Apartment in Gurgaon",
        "location": "Gurgaon",
        "price": 15000000,
        "bhk": 3,
        "type": "Apartment",
        "description": "A luxurious 3BHK apartment in the heart of Gurgaon with modern amenities.",
        "status": "sale",
        "images": [
            "http://localhost:5000/uploads/1670234123456-image1.jpg",
            "http://localhost:5000/uploads/1670234123457-image2.jpg",
            "http://localhost:5000/uploads/1670234123458-image3.jpg"
        ],
        "date": "2022-12-05T11:15:23.456Z",
        "owner": {
            "id": "638d1f7a9e8b9a0b1c8d4e5f",
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
]
```

---

### 10. Get Property Recommendations
**Endpoint:** `GET /recommendations/:id`  

**Response (200):**
```json
[
    {
        "_id": "638d2b3c9e8b9a0b1c8d4e6b",
        "title": "Modern Apartment in Gurgaon",
        "location": "Gurgaon",
        "price": 12000000,
        "bhk": 3,
        "type": "Apartment",
        "description": "A modern 3BHK apartment with great amenities.",
        "status": "sale",
        "images": [
            "http://localhost:5000/uploads/1670235123456-image1.jpg",
            "http://localhost:5000/uploads/1670235123457-image2.jpg"
        ],
        "date": "2022-12-05T11:20:12.789Z",
        "owner": {
            "id": "638d1f8b9e8b9a0b1c8d4e60",
            "name": "Jane Smith",
            "email": "jane@example.com"
        }
    }
]
```

---

### 11. Update Property Details
**Endpoint:** `PUT /properties/:id`  

**Request:**
```json
{
    "title": "Updated Luxury Apartment in Gurgaon",
    "price": 18000000,
    "description": "Updated description with more amenities."
}
```

**Response (200):**
```json
{
    "msg": "Property updated successfully",
    "property": {
        "_id": "638d2a1b9e8b9a0b1c8d4e6a",
        "title": "Updated Luxury Apartment in Gurgaon",
        "location": "Gurgaon",
        "price": 18000000,
        "bhk": 3,
        "type": "Apartment",
        "description": "Updated description with more amenities.",
        "status": "sale",
        "images": [
            "http://localhost:5000/uploads/1670234123456-image1.jpg",
            "http://localhost:5000/uploads/1670234123457-image2.jpg",
            "http://localhost:5000/uploads/1670234123458-image3.jpg"
        ],
        "date": "2022-12-05T11:15:23.456Z",
        "owner": {
            "id": "638d1f7a9e8b9a0b1c8d4e5f",
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

---

### 12. Delete Property
**Endpoint:** `DELETE /properties/:id`  

**Response (200):**
```json
{
    "msg": "Property deleted successfully",
    "property": {
        "_id": "638d2a1b9e8b9a0b1c8d4e6a",
        "title": "Updated Luxury Apartment in Gurgaon",
        "location": "Gurgaon",
        "price": 18000000,
        "bhk": 3,
        "type": "Apartment",
        "description": "Updated description with more amenities.",
        "status": "sale",
        "images": [
            "http://localhost:5000/uploads/1670234123456-image1.jpg",
            "http://localhost:5000/uploads/1670234123457-image2.jpg",
            "http://localhost:5000/uploads/1670234123458-image3.jpg"
        ],
        "date": "2022-12-05T11:15:23.456Z",
        "owner": "638d1f7a9e8b9a0b1c8d4e5f"
    }
}
```

---

### 13. User Logout
**Endpoint:** `POST /auth/logout`  

**Response (200):**
```json
{
    "msg": "User logged out successfully"
}
```

---

## Error Handling
The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid request data or missing required fields  
- **401 Unauthorized**: Missing or invalid token  
- **404 Not Found**: Resource not found  
- **500 Internal Server Error**: Server error  

**Error response format:**
```json
{
    "msg": "Error message describing the issue"
}
```
