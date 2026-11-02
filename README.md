\# MarketHub – Multi-Vendor E-Commerce Marketplace

MarketHub is a full-stack multi-vendor e-commerce platform that allows customers to browse and purchase products, vendors to manage their stores, and administrators to manage marketplace operations.

## Features

### Customer
- User registration and login with JWT authentication
- Browse and search products
- Filter products by category and price
- Shopping cart with Redis caching
- Secure checkout and Razorpay test payments
- Order history and order tracking
- Product reviews and ratings
- Coupon code application
- Downloadable PDF invoices

### Vendor
- Vendor registration and approval workflow
- Product creation, editing, and deletion
- Product image uploads using AWS S3
- Vendor order management
- Order status updates

### Administrator
- Admin dashboard and marketplace statistics
- Manage customers, vendors, and products
- Approve or reject vendor applications
- Manage orders and coupons

### Search and Performance
- Elasticsearch-powered product search
- Redis-based cart caching

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Search | Elasticsearch |
| Caching | Redis |
| Payments | Razorpay Test Mode |
| Image Storage | AWS S3 |
| PDF Generation | PDFKit |
| API Testing | Postman |
| Version Control | Git, GitHub |

## Project Structure

```text
MarketHub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── .gitignore
```

## Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB
- Redis
- Elasticsearch
- AWS S3 configuration
- Razorpay test account

### 1. Clone the repository

```bash
git clone https://github.com/nazhathunnisa05-hub/MarketHub.git
cd MarketHub
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder and configure your own environment variables.

Required configuration includes:
- MongoDB connection URI
- JWT secret
- Redis connection settings
- Elasticsearch connection settings
- AWS S3 credentials and bucket settings
- Razorpay test API credentials

Never upload your `.env` file or credentials to GitHub.

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Payment Information

MarketHub uses Razorpay Test Mode for payment integration. Use test credentials and test payment methods during development.

## Security

- Password hashing using bcryptjs
- JWT-based authentication
- Role-based access control
- Environment variables for sensitive configuration
- Protected API routes

## Future Improvements

- Production deployment
- Automated testing
- Improved monitoring and logging
- Enhanced payment webhook verification
- Additional marketplace analytics

## Author

**Nazhath Unnisa**

GitHub: https://github.com/nazhathunnisa05-hub

## Project Status

Core marketplace features implemented. Deployment and final documentation are in progress.