# 📱 MobileStore — Premium Phone E-Commerce

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Sander21asfgasdfss/MatrixLeb1)
![Express.js](https://img.shields.io/badge/backend-Express.js-000?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/frontend-Vanilla_JS-F7DF1E?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

A fullstack mobile phone store with shopping cart, card payment, order management, and admin dashboard.

---

## Live Demo

| | |
|---|---|
| **Frontend** | [`https://mobile-store.onrender.com`](https://mobile-store.onrender.com) |
| **Admin Panel** | Click **Admin** in nav — `admin` / `admin123` |

> Deploy your own copy with the button above.

---

## Screenshots

### 🏪 Product Catalog
Browse, search, and filter smartphones by brand with real-time sorting.

### 🛒 Shopping Cart
Add items, adjust quantities, remove products — instant total updates.

### 💳 Checkout
Choose delivery speed, pay by **Visa card** with live preview or **Cash on Delivery**.

### 📦 Order Tracking
View order history with delivery status and estimated dates.

### 🔧 Admin Dashboard
Manage products, update order statuses, and view customer messages.

---

## Features

- **Smartphone Catalog** — Browse 8+ flagship phones with search, brand filter, and price/rating sort
- **Shopping Cart** — Add, update, remove items with real-time totals
- **Checkout** — 3 delivery options (Standard/Express/Next Day), card validation with live preview, or Cash on Delivery
- **Admin Panel** — Dashboard stats, product CRUD, order status management, contact message viewer
- **Contact Form** — Submit inquiries stored server-side with read/unread tracking
- **Order History** — Persistent local storage with status tracking (confirmed → shipped → delivered)

---

## Quick Start

```bash
npm install
npm start
```

Open `http://localhost:3002`

---

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

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js, Node.js |
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Payment | Visa card validation + Cash on Delivery |
| API | REST (JSON) |

---

## Project Structure

```
mobile-store/
├── backend/
│   ├── server.js          Express server & API routes
│   └── products.js        Product data
├── frontend/
│   ├── index.html         SPA entry point
│   ├── css/style.css      All styles
│   ├── js/app.js          Client-side logic
│   └── images/            Static assets
├── render.yaml            Render deployment config
├── package.json
└── .gitignore
```

---

## Deployment

### Deploy to Render (Free)

1. Click the **Deploy to Render** button above
2. Connect your GitHub account
3. Render auto-detects the `render.yaml` config
4. Your app will be live in ~2 minutes

Or manually:

1. Push this repo to GitHub
2. In [Render Dashboard](https://dashboard.render.com) → New Web Service
3. Connect your repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Deploy
