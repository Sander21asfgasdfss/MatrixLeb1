# 📱 MobileStore — Premium Phone E-Commerce

A fullstack mobile phone store with shopping cart, Visa payment processing, order management, and an admin dashboard.

## Tech Stack

**Backend** — Express.js, REST API  
**Frontend** — Vanilla JS, HTML5, CSS3 (no frameworks)  
**Payment** — Visa card validation + Cash on Delivery

## Features

- **Smartphone Catalog** — Browse, search, filter by brand, sort by price/rating
- **Shopping Cart** — Add/remove items, update quantities, real-time total
- **Checkout** — Delivery options (Standard/Express/Next Day), card preview, form validation
- **Admin Panel** — Dashboard with stats, product CRUD, order status management, contact messages
- **Contact Form** — Submit inquiries stored server-side
- **Order History** — Local storage persistence with status tracking

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Open `http://localhost:3002` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/cart/add` | Add item to cart |
| POST | `/api/cart/update` | Update item quantity |
| POST | `/api/cart/remove` | Remove from cart |
| GET | `/api/cart/:sessionId` | Get cart |
| POST | `/api/checkout` | Place order |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Admin stats |
| GET/POST/PUT/DELETE | `/api/admin/products` | Product management |
| GET/PUT | `/api/admin/orders` | Order management |
| GET/PUT | `/api/admin/messages` | Message management |

## Admin Access

Login at `Admin` link in navigation — credentials: `admin` / `admin123`

## Project Structure

```
mobile-store/
├── backend/
│   ├── server.js          # Express server & API routes
│   └── products.js        # Product data
├── frontend/
│   ├── index.html         # SPA entry point
│   ├── css/style.css      # All styles
│   ├── js/app.js          # Client-side logic
│   └── images/            # Static assets
├── package.json
└── .gitignore
```
