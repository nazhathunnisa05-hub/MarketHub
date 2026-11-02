# MarketHub – System Architecture

## 1. Project Overview

MarketHub is a full-stack multi-vendor e-commerce marketplace. It supports three main roles: Customer, Vendor, and Administrator.

The system uses a React frontend, Node.js and Express backend, MongoDB database, Elasticsearch for product search, Redis for caching, AWS S3 for image storage, and Razorpay for payment processing.

## 2. Architecture Diagram

```text
                 CUSTOMER / VENDOR / ADMIN
                           |
                           v
                  REACT FRONTEND
                           |
                    REST API (HTTP)
                           |
                           v
                NODE.JS + EXPRESS BACKEND
                           |
        +------------------+-------------------+
        |                  |                   |
        v                  v                   v
     MONGODB             REDIS            ELASTICSEARCH
   Main Database      Cart Caching        Product Search
        |
        v
   ORDER / PRODUCT /
   USER / REVIEW DATA

        BACKEND INTEGRATIONS
        |                  |
        v                  v
     AWS S3             RAZORPAY
   Product Images       Payments
        |
        v
   PDFKIT
   Invoice Generation
```

## 3. Frontend Layer

**Technology:** React.js, JavaScript, CSS

Responsibilities:
- Display the marketplace interface.
- Handle customer registration and login.
- Display products and product details.
- Manage shopping cart and checkout.
- Display order history and reviews.
- Provide vendor and admin dashboards.
- Communicate with backend APIs.

## 4. Backend Layer

**Technology:** Node.js and Express.js

Responsibilities:
- Handle REST API requests.
- Authenticate users using JWT.
- Apply role-based authorization.
- Manage products, users, vendors, and orders.
- Process coupons and reviews.
- Handle payment verification and webhooks.
- Generate downloadable PDF invoices.

## 5. Database Layer

**Technology:** MongoDB and Mongoose

Main collections:
- Users
- Products
- Vendors
- Carts
- Orders
- Reviews
- Coupons

MongoDB stores the main application data.

## 6. Search and Caching

**Elasticsearch**
- Supports product search.
- Searches product names, descriptions, and categories.
- Uses fuzzy matching to improve search results.

**Redis**
- Caches shopping cart information.
- Reduces repeated database reads.
- Invalidates cart cache when cart data changes.

## 7. External Integrations

**AWS S3**
- Stores product images.
- Uses signed URLs to access private images.

**Razorpay**
- Integrates test-mode online payments.
- Supports payment verification and webhook processing.

**PDFKit**
- Generates downloadable order invoices in PDF format.

## 8. Security

- Password hashing with bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Protected backend routes.
- Environment variables for sensitive configuration.
- Private S3 bucket and signed image URLs.

## 9. Application Workflow

1. A user registers and logs in.
2. The backend authenticates the user and issues a JWT.
3. Customers browse and search products.
4. Customers add products to their Redis-cached cart.
5. Customers submit orders and complete payment.
6. Vendors manage their products and update order statuses.
7. Administrators manage marketplace users, products, vendors, orders, and coupons.
8. Customers view order history and download invoices.

## 10. Conclusion

MarketHub combines modern frontend and backend technologies with database management, search, caching, cloud storage, and payment integration to provide a multi-vendor e-commerce platform.