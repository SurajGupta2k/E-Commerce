# E-Commerce Platform

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js) with modern features and a beautiful UI.

## Features

- 🛍️ Product browsing and searching
- 🛒 Shopping cart management
- 👤 User authentication and authorization
- 📱 Responsive design
- 🔒 Secure session management
- 📊 Admin dashboard with analytics

## Tech Stack

### Frontend
- React with Vite
- Zustand for state management
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Redis for session management
- JWT for authentication

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd e-commerce
```

2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REDIS_URL=your_redis_url
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
```

4. Run the application
```bash
# Run backend (from root directory)
npm run dev

# Run frontend (from frontend directory)
npm run dev
```

## Project Structure

```
├── backend/
│   ├── controllers/    # Request handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── lib/          # Utilities and configurations
│   └── server.js     # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── stores/     # Zustand stores
│   │   ├── lib/        # Utilities
│   │   └── App.jsx    # Root component
│   └── index.html
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/profile - Get user profile

### Products
- GET /api/products - Get all products
- GET /api/products/:id - Get single product
- POST /api/products - Add new product (admin)
- PUT /api/products/:id - Update product (admin)
- DELETE /api/products/:id - Delete product (admin)

### Cart
- GET /api/cart - Get user's cart
- POST /api/cart - Add item to cart
- PUT /api/cart/:itemId - Update cart item
- DELETE /api/cart/:itemId - Remove item from cart

### Coupons
- POST /api/coupons - Create coupon (admin)
- GET /api/coupons - List all coupons (admin)
- POST /api/coupons/validate - Validate coupon code

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License. 