const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
let products = require('./products');

const app = express();
const PORT = process.env.PORT || 3002;

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const ADMIN_TOKENS = new Set();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'frontend')));

let carts = {};
let allOrders = [];
let contactMessages = [];

const DELIVERY_METHODS = {
  standard: { label: 'Standard Delivery', fee: 0, days: '5-7 business days' },
  express:  { label: 'Express Delivery',  fee: 9.99,  days: '2-3 business days' },
  nextday:  { label: 'Next Day Delivery',  fee: 19.99, days: '1 business day' }
};

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ') || !ADMIN_TOKENS.has(auth.slice(7))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function nextProductId() {
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

function getCart(sessionId) {
  if (!carts[sessionId]) {
    carts[sessionId] = { items: [], sessionId };
  }
  return carts[sessionId];
}

app.get('/api/products', (req, res) => {
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

app.post('/api/cart/add', (req, res) => {
  const { sessionId, productId, quantity = 1 } = req.body;
  if (!sessionId || !productId) return res.status(400).json({ error: 'sessionId and productId required' });

  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const cart = getCart(sessionId);
  const existing = cart.items.find(i => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, name: product.name, price: product.price, image: product.image });
  }

  res.json({ cart });
});

app.post('/api/cart/update', (req, res) => {
  const { sessionId, productId, quantity } = req.body;
  if (!sessionId || !productId) return res.status(400).json({ error: 'sessionId and productId required' });

  const cart = getCart(sessionId);
  const item = cart.items.find(i => i.productId === productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart' });

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  res.json({ cart });
});

app.post('/api/cart/remove', (req, res) => {
  const { sessionId, productId } = req.body;
  if (!sessionId || !productId) return res.status(400).json({ error: 'sessionId and productId required' });

  const cart = getCart(sessionId);
  cart.items = cart.items.filter(i => i.productId !== productId);

  res.json({ cart });
});

app.get('/api/cart/:sessionId', (req, res) => {
  const cart = getCart(req.params.sessionId);
  res.json({ cart });
});

app.post('/api/checkout', (req, res) => {
  const { sessionId, payment, delivery } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const cart = getCart(sessionId);
  if (cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  if (!payment || !payment.method) {
    return res.status(400).json({ error: 'Payment method is required' });
  }

  if (!delivery || !delivery.fullName || !delivery.phone || !delivery.address || !delivery.city) {
    return res.status(400).json({ error: 'All delivery fields are required' });
  }

  let paymentInfo;

  if (payment.method === 'cod') {
    paymentInfo = { method: 'Cash on Delivery' };
  } else {
    if (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.cardHolder) {
      return res.status(400).json({ error: 'All card fields are required' });
    }
    const cardClean = payment.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardClean)) return res.status(400).json({ error: 'Invalid card number' });
    if (!/^\d{3,4}$/.test(payment.cvv)) return res.status(400).json({ error: 'Invalid CVV' });
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) return res.status(400).json({ error: 'Invalid expiry format (MM/YY)' });
    paymentInfo = { method: 'Visa', lastFour: cardClean.slice(-4), cardHolder: payment.cardHolder };
  }

  const method = DELIVERY_METHODS[delivery.method] || DELIVERY_METHODS.standard;
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.round((subtotal + method.fee) * 100) / 100;
  const orderId = uuidv4().slice(0, 8).toUpperCase();

  const order = {
    orderId,
    items: [...cart.items],
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: method.fee,
    total,
    payment: paymentInfo,
    delivery: {
      fullName: delivery.fullName,
      phone: delivery.phone,
      address: delivery.address,
      city: delivery.city,
      state: delivery.state || '',
      zip: delivery.zip || '',
      instructions: delivery.instructions || '',
      method: delivery.method || 'standard',
      methodLabel: method.label,
      estimatedDays: method.days
    },
    status: 'confirmed',
    date: new Date().toISOString()
  };

  carts[sessionId] = { items: [], sessionId };
  allOrders.unshift(order);

  res.json({ success: true, order });
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const msg = { id: uuidv4().slice(0, 8), name, email, subject, message, date: new Date().toISOString(), read: false };
  contactMessages.unshift(msg);
  res.json({ success: true, message: 'Message received. We will get back to you soon.' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  ADMIN_TOKENS.add(token);
  res.json({ success: true, token });
});

app.get('/api/admin/dashboard', adminAuth, (req, res) => {
  const totalProducts = products.length;
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
  const totalMessages = contactMessages.length;
  const unreadMessages = contactMessages.filter(m => !m.read).length;
  res.json({ totalProducts, totalOrders, totalRevenue, totalMessages, unreadMessages });
});

app.get('/api/admin/products', adminAuth, (req, res) => {
  res.json({ products });
});

app.post('/api/admin/products', adminAuth, (req, res) => {
  const { name, brand, price, originalPrice, image, description, specs, rating, reviews, badge } = req.body;
  if (!name || !brand || !price) return res.status(400).json({ error: 'name, brand, and price required' });
  const product = {
    id: nextProductId(),
    name, brand, price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    image: image || '',
    description: description || '',
    specs: specs || {},
    rating: rating ? parseFloat(rating) : 0,
    reviews: reviews ? parseInt(reviews) : 0,
    badge: badge || null
  };
  products.push(product);
  res.json({ success: true, product });
});

app.put('/api/admin/products/:id', adminAuth, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { name, brand, price, originalPrice, image, description, specs, rating, reviews, badge } = req.body;
  if (name !== undefined) product.name = name;
  if (brand !== undefined) product.brand = brand;
  if (price !== undefined) product.price = parseFloat(price);
  product.originalPrice = originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : product.originalPrice;
  if (image !== undefined) product.image = image;
  if (description !== undefined) product.description = description;
  if (specs !== undefined) product.specs = specs;
  if (rating !== undefined) product.rating = parseFloat(rating);
  if (reviews !== undefined) product.reviews = parseInt(reviews);
  product.badge = badge !== undefined ? (badge || null) : product.badge;
  res.json({ success: true, product });
});

app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(idx, 1);
  res.json({ success: true });
});

app.get('/api/admin/orders', adminAuth, (req, res) => {
  res.json({ orders: allOrders });
});

app.put('/api/admin/orders/:orderId', adminAuth, (req, res) => {
  const order = allOrders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { status } = req.body;
  if (status) order.status = status;
  res.json({ success: true, order });
});

app.get('/api/admin/messages', adminAuth, (req, res) => {
  res.json({ messages: contactMessages });
});

app.put('/api/admin/messages/:id', adminAuth, (req, res) => {
  const msg = contactMessages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.read = true;
  res.json({ success: true, message: msg });
});

app.listen(PORT, () => {
  console.log(`Mobile Store server running on http://localhost:${PORT}`);
});
