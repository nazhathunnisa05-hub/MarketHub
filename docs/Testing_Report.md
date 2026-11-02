# MarketHub – Testing Report

## 1. Introduction
This document records the functional and integration testing performed on the MarketHub multi-vendor e-commerce application.

## 2. Testing Environment
- Frontend: React.js
- Backend: Node.js and Express.js
- Database: MongoDB
- Search Engine: Elasticsearch
- Cache: Redis
- Payment Gateway: Razorpay Test Mode
- API Testing: Postman
- Development Environment: Visual Studio Code

## ## 3. Functional Test Cases

| No. | Feature | Actual Result | Status |
|---|---|---|---|
| 1 | Customer Registration | Account created successfully | PASS |
| 2 | Customer Login | Login successful | PASS |
| 3 | Vendor Application | Application submitted successfully | PASS |
| 4 | Vendor Approval | Admin approved vendor application | PASS |
| 5 | Vendor Dashboard | Approved vendor accessed dashboard | PASS |
| 6 | Product Creation | Product created successfully | PASS |
| 7 | Image Upload | Product image uploaded and displayed after refresh | PASS |
| 8 | Product Search | Product found using search | PASS |
| 9 | Product Filtering | Category and price filters worked | PASS |
| 10 | Product Sorting | Price sorting worked | PASS |
| 11 | Add to Cart | Product added successfully | PASS |
| 12 | Cart Quantity | Quantity and subtotal updated correctly | PASS |
| 13 | Cart Removal | Product removed successfully | PASS |
| 14 | Checkout | Shipping details accepted | PASS |
| 15 | Razorpay Payment | Test payment verified successfully | PASS |
| 16 | Order Visibility | Customer and vendor could view order | PASS |
| 17 | Order Status Update | Vendor updated shipment status | PASS |
| 18 | Customer Order Tracking | Customer saw updated shipment status | PASS |
| 19 | Product Reviews | Review submitted successfully | PASS |
| 20 | Coupon Creation | Admin created coupon successfully | PASS |
| 21 | Coupon Validation | Customer applied coupon successfully | PASS |
| 22 | PDF Invoice | Invoice downloaded and opened successfully | PASS |
| 23 | Admin Dashboard | Marketplace statistics displayed | PASS |
| 24 | Admin Order Management | Admin viewed marketplace order | PASS |
| 25 | Admin Product Management | Admin updated product successfully | PASS |
| 26 | Admin Coupon Management | Admin activated and deactivated coupon | PASS |
## 4. Integration Testing

| Component | Expected Result | Status |
|---|---|---|
| MongoDB | Database connection successful | To be recorded |
| Redis | Cache connection successful | To be recorded |
| Elasticsearch | Search engine connection successful | To be recorded |
| AWS S3 | Product image upload and retrieval successful | To be recorded |
| Razorpay | Test payment processing and verification successful | To be recorded |

## 5. Security Testing
- JWT authentication for protected routes.
- Role-based access control for customers, vendors and administrators.
- Password hashing.
- Validation of protected API requests.
- Environment variables used for sensitive configuration.

## 6. Conclusion
This report documents the testing activities for MarketHub. Final test results should be updated after executing each test case and verifying its actual outcome.