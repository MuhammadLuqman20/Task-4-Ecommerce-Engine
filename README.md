# E-Commerce Engine with Checkout Sandbox

A full-stack, production-grade e-commerce application featuring JWT authentication, persistent shopping cart synchronization, Stripe test mode checkout sandbox, atomic inventory management, and an admin dashboard.

---

## 🌟 Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Axios, Lucide Icons, Modern Light Theme Vanilla CSS Design System
- **Backend**: Node.js, Express.js (ES Modules), Helmet, CORS, Morgan
- **Database**: MongoDB with Mongoose (with automated resilient in-memory fallback for instant setup)
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt password hashing (10 salt rounds)
- **Payments**: Stripe Test Sandbox & Stripe Elements with server-side payment verification
- **Administration**: Admin Dashboard (`/admin`) for real-time catalog CRUD and customer order fulfillment

---

## 🚀 Key Features Implemented

1. **User Registration & Login**:
   - Secure password hashing with `bcryptjs`.
   - JWT tokens generated with configurable expiration (`JWT_EXPIRES_IN=7d`).
   - Profile retrieval via protected route (`/api/auth/me`).
2. **Product Catalog & Detail View**:
   - Real-time search across title, description, and category.
   - Category filtering pills and price/rating sorting.
   - Dynamic inventory stock badges (In Stock, Low Stock, Out of Stock).
3. **Persistent Shopping Cart**:
   - User carts persist across sessions and devices in MongoDB.
   - Real-time quantity adjustment, product stock limit checks, and item removal.
   - Dynamic calculation of subtotal, 8% tax, and conditional free shipping ($100+).
4. **Stripe Checkout Sandbox**:
   - Server-side recalculation of totals (prevents client-side price tampering).
   - Generates Stripe `PaymentIntent` with test mode keys.
   - Interactive sandbox test cards (`4242 4242 4242 4242` for success, decline cards for error testing).
5. **Server-Side Verification & Atomic Inventory Deduction**:
   - Server directly validates Stripe payment status before creating any order.
   - Inventory decremented atomically using MongoDB `$gte` condition checks (`stockQuantity >= requestedQuantity`) to prevent race conditions or overselling.
   - Idempotent order processing based on unique `stripePaymentIntentId`.
   - Cart is automatically cleared upon confirmed order creation.
6. **Order History**:
   - Authenticated user order history endpoint (`/api/orders/my-orders`).
   - Itemized order receipts with delivery address and Stripe transaction ID.

---

## 📁 Repository Structure

```text
Task-4-Ecommerce-Engine/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection + resilient in-memory fallback
│   │   │   └── stripe.js             # Stripe SDK configuration & test mode helper
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile
│   │   │   ├── productController.js  # Catalog browse, search, filters
│   │   │   ├── cartController.js     # Persistent cart operations
│   │   │   ├── checkoutController.js # Stripe intents, payment verification, atomic stock
│   │   │   └── orderController.js    # Order history & receipts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer protection & role guards
│   │   │   └── errorMiddleware.js    # Global error & 404 handlers
│   │   ├── models/
│   │   │   ├── User.js               # User schema + bcrypt hooks
│   │   │   ├── Product.js            # Product schema + stockQuantity
│   │   │   ├── Cart.js               # Cart schema + populated references
│   │   │   └── Order.js              # Order schema + paymentInfo
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── checkoutRoutes.js
│   │   │   └── orderRoutes.js
│   │   ├── seeds/
│   │   │   └── seedProducts.js       # Seed script with realistic catalog & demo user
│   │   ├── tests/
│   │   │   └── e2eTest.js            # Automated integration test suite
│   │   ├── utils/
│   │   │   └── generateToken.js      # JWT helper
│   │   └── server.js                 # Express app initialization
│   ├── .env                          # Development environment config
│   ├── .env.example                  # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/ (Navbar, Footer, ProtectedRoute, AdminRoute)
│   │   │   ├── product/ (ProductCard, ProductFilters)
│   │   │   ├── cart/ (CartItem, CartSummary)
│   │   │   └── checkout/ (StripeCardForm)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User authentication state
│   │   │   └── CartContext.jsx       # Persistent cart state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── AdminPage.jsx         # Admin catalog CRUD & order status
│   │   ├── services/
│   │   │   └── api.js                # Axios client with JWT interceptor
│   │   ├── App.jsx                   # Route declarations
│   │   ├── main.jsx
│   │   └── index.css                 # Clean modern light theme design system
│   ├── .env                          # Frontend environment config
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 tested)
- **npm**: v9 or higher

### 2. Running the Backend
```bash
cd backend
npm install
npm start
```
*Note: The backend automatically connects to your MongoDB instance. If a local MongoDB daemon is not running, it gracefully boots an in-memory MongoDB instance and auto-seeds catalog products.*

Backend API URL: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### 3. Running the Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend App URL: `http://localhost:5173`

---

## 🧪 Testing Credentials & Stripe Test Cards

### Pre-seeded Demo Accounts:
- **Customer Account**:
  - **Email**: `customer@example.com`
  - **Password**: `Password123!`
  *(Login page includes a 1-click "Auto-Fill Customer" button).*
- **Admin Account**:
  - **Email**: `admin@example.com`
  - **Password**: `AdminPassword123!`
  *(Login page includes a 1-click "Auto-Fill Admin" button. Grants access to the **Admin Dashboard** at `/admin` for product inventory management and order processing).*

### Stripe Sandbox Test Cards:
- **Success Card**: `4242 4242 4242 4242` | Exp: Any future date | CVC: `123`
- **Decline Card**: `4000 0000 0000 0002` | Exp: Any future date | CVC: `123`
- **Insufficient Funds**: `4000 0000 0000 9995` | Exp: Any future date | CVC: `123`

### Run Automated End-to-End Suite:
```bash
cd backend
node src/tests/e2eTest.js
```
Runs a complete 7-step automated test verifying:
1. API Health & Configuration
2. User Registration & JWT Issuance
3. Catalog & Stock Verification
4. Persistent Cart Operations
5. PaymentIntent Creation & Server Total Calculation
6. Server-side Payment Verification & Atomic Stock Deduction
7. Order History Verification

---

## 🛡️ Security Best Practices Implemented

- **No Secrets in Code**: Secrets are stored strictly in `.env` files (loaded via `dotenv`).
- **Client Price Immunity**: Subtotal is always recalculated on the server based on database prices.
- **Race Condition Prevention**: Stock deduction uses atomic operations:
  ```javascript
  await Product.findOneAndUpdate(
    { _id: productId, stockQuantity: { $gte: requestedQty } },
    { $inc: { stockQuantity: -requestedQty } }
  );
  ```
- **Idempotency**: Duplicate payment verification requests return the existing order rather than creating duplicate orders or double-deducting stock.
- **Route Protection**: Client-side route guards via `ProtectedRoute` and server-side verification with `protect` JWT middleware.
