# MarketHub – API Documentation

## 1. Overview

MarketHub provides REST APIs for a multi-vendor e-commerce marketplace.

**Base URL:** `http://localhost:5000`

**API Prefix:** `/api`

**Backend:** Node.js and Express.js

**Authentication:** JSON Web Token (JWT)

## 2. Authentication

Protected endpoints require a JWT access token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new account | Public |
| POST | `/api/auth/login` | Login to the marketplace | Public |

## 3. Product APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/products` | Get products with search and filters | Public |
| GET | `/api/products/:id` | Get product details | Public |
| GET | `/api/products/my-products` | Get vendor's products | Vendor |
| GET | `/api/products/admin/all` | Get all products for administration | Admin |
| POST | `/api/products` | Create a product | Vendor |
| PUT | `/api/products/:id` | Update a product | Vendor/Admin |
| DELETE | `/api/products/:id` | Delete a product | Vendor/Admin |

### Product Search and Filters

The product listing endpoint supports query parameters:

```text
GET /api/products?search=speaker
GET /api/products?category=Electronics
GET /api/products?minPrice=500&maxPrice=3000
GET /api/products?sort=price_asc
GET /api/products?sort=price_desc
```

## 4. Vendor APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/vendors/apply` | Submit vendor application | Customer |
| GET | `/api/vendors/pending` | View pending applications | Admin |
| PATCH | `/api/vendors/:id/review` | Review vendor application | Admin |

## 5. Image Upload API

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/uploads/image` | Upload product image to AWS S3 | Vendor |

**Content type:** `multipart/form-data`

**Form field:** `image`

## 6. Shopping Cart APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/cart` | View shopping cart | Customer/Vendor |
| POST | `/api/cart/items` | Add product to cart | Customer/Vendor |
| PATCH | `/api/cart/items/:productId` | Update item quantity | Customer/Vendor |
| DELETE | `/api/cart/items/:productId` | Remove an item | Customer/Vendor |
| DELETE | `/api/cart` | Clear shopping cart | Customer/Vendor |

Redis is used to cache cart information.

## 7. Order APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place a new order | Customer |
| GET | `/api/orders/my-orders` | View customer orders | Customer |
| GET | `/api/orders/vendor` | View vendor orders | Vendor |
| PATCH | `/api/orders/:id/status` | Update order status | Vendor |
| GET | `/api/orders/admin/all` | View all marketplace orders | Admin |

Supported order statuses include placed, packed, shipped, and delivered. Cancelled orders may also be represented in the order model.

## 8. Payment APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/payments/create-order` | Create Razorpay payment order | Customer |
| POST | `/api/payments/verify` | Verify payment | Customer |
| POST | `/api/payments/webhook` | Receive Razorpay payment events | Razorpay webhook |

Payments are integrated using Razorpay Test Mode.

The webhook endpoint is handled separately using raw request-body parsing for signature verification.

## 9. Review APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/reviews/:productId` | View product reviews | Public |
| POST | `/api/reviews` | Submit a product review | Customer |

Customers can submit reviews for eligible delivered orders.

## 10. Coupon APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/coupons/validate` | Validate coupon during checkout | Customer |
| POST | `/api/coupons` | Create a coupon | Admin |
| GET | `/api/coupons/admin/all` | View all coupons | Admin |
| PATCH | `/api/coupons/:id/status` | Activate or deactivate coupon | Admin |
| DELETE | `/api/coupons/:id` | Delete coupon | Admin |

## 11. Invoice API

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/invoices/:orderId` | Download order invoice as PDF | Customer |

Customers can download invoices for their own orders.

## 12. Admin APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/dashboard` | View marketplace dashboard statistics | Admin |

## 13. Health Check APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Check whether the API server is running | Public |
| GET | `/api/health/db` | Check MongoDB connection status | Public |

## 14. Example API Requests

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Example request body (illustrative):

```json
{
  "email": "customer@example.com",
  "password": "YOUR_PASSWORD"
}
```

### Create Product

```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Example request body:

```json
{
  "name": "Bluetooth Speaker",
  "description": "Portable wireless speaker",
  "price": 1999,
  "category": "Electronics",
  "stock": 10
}
```

### Add Item to Cart

```http
POST /api/cart/items
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Example request body (illustrative):

```json
{
  "productId": "PRODUCT_ID",
  "quantity": 1
}
```

## 15. Error Handling

The API uses standard HTTP status codes, including:

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required or invalid |
| 403 | Permission denied |
| 404 | Resource not found |
| 500 | Internal server error |
| 503 | Service unavailable |

Exact response fields and validation rules depend on the individual controller.

## 16. Technologies Used

- React.js
- Node.js
- Express.js
- MongoDB and Mongoose
- JWT and bcryptjs
- Redis
