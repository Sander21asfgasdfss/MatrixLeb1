const API = window.location.origin;
let products = [];
let currentFilter = 'all';
let currentSessionId = localStorage.getItem('sessionId') || generateSessionId();

function generateSessionId() {
  const id = 'sess_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('sessionId', id);
  return id;
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
});

async function loadProducts() {
  try {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    products = data.products;
    renderProducts();
  } catch (e) {
    console.error('Failed to load products', e);
  }
}

async function loadCart() {
  try {
    const res = await fetch(`${API}/api/cart/${currentSessionId}`);
    const data = await res.json();
    updateCartUI(data.cart);
  } catch (e) {
    console.error('Failed to load cart', e);
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  let filtered = [...products];

  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.brand === currentFilter);
  }

  const search = document.getElementById('searchInput').value.toLowerCase();
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search));
  }

  const sort = document.getElementById('sortSelect').value;
  switch (sort) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📱</div><h3>No phones found</h3><p>Try a different search or filter</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;
    const stars = getStars(p.rating);
    const badgeClass = p.badge ? p.badge.toLowerCase().replace(' ', '-') : '';
    return `
      <div class="product-card" onclick="openProduct(${p.id})">
        ${p.badge ? `<div class="product-badge ${badgeClass}">${p.badge}</div>` : ''}
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2214%22>${p.name[0]}</text></svg>'">
        </div>
        <div class="product-info">
          <div class="product-brand">${p.brand}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${stars}</span>
            <span>${p.rating}</span>
            <span>(${formatNumber(p.reviews)})</span>
          </div>
          <div class="product-price-row">
            <div>
              <span class="product-price">$${p.price.toFixed(2)}</span>
              ${hasDiscount ? `<span class="product-price-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="product-actions">
              <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
              <button class="pay-now-btn" onclick="event.stopPropagation(); payNow(${p.id})">Pay Now</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function setFilter(brand, btn) {
  currentFilter = brand;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts();
}

function filterProducts() {
  renderProducts();
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`${page}-page`).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-page="${page}"]`).classList.add('active');
  if (page === 'orders') renderOrders();
  closeMenu();
}

function renderOrders() {
  const container = document.getElementById('ordersContainer');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No orders yet</h3>
        <p>Complete a purchase to see your order history</p>
      </div>
    `;
    return;
  }
  container.innerHTML = orders.map(o => {
    const d = o.delivery || {};
    const statusColors = { confirmed: '#f39c12', shipped: '#3498db', delivered: '#00b894', cancelled: '#e74c3c' };
    const statusIcons = { confirmed: '⏳', shipped: '🚚', delivered: '✅', cancelled: '❌' };
    const color = statusColors[o.status] || '#f39c12';
    const icon = statusIcons[o.status] || '⏳';
    const feeLine = o.deliveryFee === 0 ? 'Free' : '$' + (o.deliveryFee || 0).toFixed(2);

    const isCod = o.payment.method === 'Cash on Delivery';
    const paymentLine = isCod
      ? 'Cash on Delivery'
      : 'Visa •••• ' + o.payment.lastFour;
    return `
    <div class="order-card">
      <div class="order-card-header">
        <span class="order-card-id">Order #${o.orderId}</span>
        <span class="order-card-date">${new Date(o.date).toLocaleDateString()}</span>
      </div>
      <div class="order-card-body">
        <div class="order-card-items">
          ${o.items.map(i => `
            <div class="order-card-item">
              <span>${i.name} × ${i.quantity}</span>
              <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-card-delivery">
          ${d.methodLabel ? `<span class="order-delivery-badge">${d.methodLabel}</span>` : ''}
          ${d.estimatedDays ? `<span class="order-estimate">🚚 ${d.estimatedDays}</span>` : ''}
        </div>
      </div>
      <div class="order-card-footer">
        <div class="order-card-total">
          <span>Total</span>
          <span>$${o.total.toFixed(2)}</span>
        </div>
        <div class="order-card-meta">
          <span>${paymentLine}</span>
          ${o.deliveryFee > 0 ? '<span>Delivery: ' + feeLine + '</span>' : ''}
        </div>
        <div class="order-card-status" style="color:${color}">
          ${icon} <span style="text-transform:capitalize">${o.status}</span>
        </div>
        ${d.address ? `
        <div class="order-card-address">
          📍 ${d.address}, ${d.city}${d.state ? ', ' + d.state : ''}
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
}

let currentProduct = null;

async function openProduct(id) {
  try {
    const res = await fetch(`${API}/api/products/${id}`);
    const data = await res.json();
    currentProduct = data.product;
    const p = currentProduct;
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;
    const stars = getStars(p.rating);

    document.getElementById('productDetail').innerHTML = `
      <div class="product-detail-wrap">
        <div class="product-detail-image">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2214%22>${p.name[0]}</text></svg>'">
        </div>
        <div class="product-detail-info">
          <div class="product-brand">${p.brand}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${stars}</span>
            <span>${p.rating}</span>
            <span>(${formatNumber(p.reviews)} reviews)</span>
          </div>
          <div class="product-price">
            $${p.price.toFixed(2)}
            ${hasDiscount ? `<span class="product-price-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <p class="product-description">${p.description}</p>
          <table class="specs-table">
            ${Object.entries(p.specs).map(([key, val]) => `<tr><td>${key}</td><td>${val}</td></tr>`).join('')}
          </table>
          <div class="detail-actions">
            <button class="detail-add-btn" onclick="addToCart(${p.id}); closeProduct();">Add to Cart — $${p.price.toFixed(2)}</button>
            <button class="detail-pay-now-btn" onclick="payNow(${p.id}); closeProduct();">Pay Now — $${p.price.toFixed(2)}</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('productOverlay').classList.add('open');
  } catch (e) {
    console.error('Failed to load product', e);
  }
}

function closeProduct(e) {
  if (e && e.target !== document.getElementById('productOverlay')) return;
  document.getElementById('productOverlay').classList.remove('open');
}

async function payNow(productId) {
  try {
    const res = await fetch(`${API}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, productId })
    });
    const data = await res.json();
    updateCartUI(data.cart);
    openCheckout();
  } catch (e) {
    showToast('Failed to process. Please try again.');
  }
}

async function addToCart(productId) {
  try {
    const res = await fetch(`${API}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, productId })
    });
    const data = await res.json();
    updateCartUI(data.cart);
    showToast('Item added to cart!');
  } catch (e) {
    console.error('Failed to add to cart', e);
  }
}

async function updateCartQuantity(productId, delta) {
  const item = cartItems.find(i => i.productId === productId);
  if (!item) return;
  const newQty = item.quantity + delta;
  try {
    const res = await fetch(`${API}/api/cart/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, productId, quantity: newQty })
    });
    const data = await res.json();
    updateCartUI(data.cart);
  } catch (e) {
    console.error('Failed to update cart', e);
  }
}

async function removeFromCart(productId) {
  try {
    const res = await fetch(`${API}/api/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, productId })
    });
    const data = await res.json();
    updateCartUI(data.cart);
    showToast('Item removed from cart');
  } catch (e) {
    console.error('Failed to remove from cart', e);
  }
}

let cartItems = [];

function updateCartUI(cart) {
  cartItems = cart.items || [];
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  document.getElementById('cartCount').textContent = count;

  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 0">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our collection and add items you love</p>
      </div>
    `;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  container.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23ddd%22 width=%2250%22 height=%2250%22/></svg>'">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="updateCartQuantity(${item.productId}, -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQuantity(${item.productId}, 1)">+</button>
          <button class="remove-item" onclick="removeFromCart(${item.productId})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  const payText = getPaymentMethod() === 'cod' ? 'Confirm Your Order' : `Pay $${total.toFixed(2)}`;
  document.getElementById('payBtnText').textContent = payText;
}

function toggleMenu() {
  const links = document.querySelector('.nav-links');
  const hamburger = document.getElementById('hamburger');
  links.classList.toggle('open');
  hamburger.classList.toggle('open');
}

function closeMenu() {
  const links = document.querySelector('.nav-links');
  const hamburger = document.getElementById('hamburger');
  links.classList.remove('open');
  hamburger.classList.remove('open');
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  closeMenu();
}

function selectPaymentMethod(el) {
  document.querySelectorAll('.payment-method-option').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  el.querySelector('input[type="radio"]').checked = true;
  const method = el.dataset.pmethod;
  if (method === 'cod') {
    document.getElementById('cardPaymentFields').style.display = 'none';
    document.getElementById('codMessage').style.display = 'block';
  } else {
    document.getElementById('cardPaymentFields').style.display = 'block';
    document.getElementById('codMessage').style.display = 'none';
  }
  updateCheckoutSummary();
}

function getPaymentMethod() {
  const selected = document.querySelector('.payment-method-option.selected');
  return selected ? selected.dataset.pmethod : 'card';
}

function selectDeliveryMethod(el) {
  document.querySelectorAll('.delivery-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  el.querySelector('input[type="radio"]').checked = true;
  updateCheckoutSummary();
}

function getDeliveryFee() {
  const selected = document.querySelector('.delivery-method.selected');
  if (!selected) return 0;
  const method = selected.dataset.method;
  if (method === 'express') return 9.99;
  if (method === 'nextday') return 19.99;
  return 0;
}

function updateCheckoutSummary() {
  const container = document.getElementById('checkoutSummary');
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = getDeliveryFee();
  const total = subtotal + fee;
  const feeLabel = fee === 0 ? 'Free' : `$${fee.toFixed(2)}`;

  container.innerHTML = cartItems.map(i => `
    <div class="summary-item">
      <span>${i.name} × ${i.quantity}</span>
      <span>$${(i.price * i.quantity).toFixed(2)}</span>
    </div>
  `).join('') + `
    <div class="summary-item summary-delivery-fee">
      <span>Delivery</span>
      <span>${feeLabel}</span>
    </div>
    <div class="summary-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
  `;

  const payLabel = getPaymentMethod() === 'cod' ? 'Confirm Your Order' : `Pay $${total.toFixed(2)}`;
  document.getElementById('payBtnText').textContent = payLabel;
}

function openCheckout() {
  if (cartItems.length === 0) return;
  toggleCart();

  document.querySelectorAll('.delivery-method').forEach((m, i) => {
    m.classList.toggle('selected', i === 0);
    if (i === 0) m.querySelector('input[type="radio"]').checked = true;
  });

  document.querySelectorAll('.payment-method-option').forEach((m, i) => {
    m.classList.toggle('selected', i === 0);
    if (i === 0) m.querySelector('input[type="radio"]').checked = true;
  });
  document.getElementById('cardPaymentFields').style.display = 'block';
  document.getElementById('codMessage').style.display = 'none';

  updateCheckoutSummary();
  document.getElementById('checkoutForm').reset();
  document.getElementById('cardNumberDisplay').textContent = '•••• •••• •••• ••••';
  document.getElementById('cardHolderDisplay').textContent = 'FULL NAME';
  document.getElementById('cardExpiryDisplay').textContent = 'MM/YY';
  document.getElementById('checkoutOverlay').classList.add('open');
}

function closeCheckout(e) {
  if (e && e.target !== document.getElementById('checkoutOverlay')) return;
  document.getElementById('checkoutOverlay').classList.remove('open');
}

function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 2) {
    val = val.slice(0, 2) + '/' + val.slice(2);
  }
  input.value = val;
}

function updateCardPreview() {
  const holder = document.getElementById('cardHolder').value.toUpperCase() || 'FULL NAME';
  document.getElementById('cardHolderDisplay').textContent = holder;

  const num = document.getElementById('cardNumber').value || '•••• •••• •••• ••••';
  document.getElementById('cardNumberDisplay').textContent = num;

  const exp = document.getElementById('cardExpiry').value || 'MM/YY';
  document.getElementById('cardExpiryDisplay').textContent = exp;
}

async function processPayment(e) {
  e.preventDefault();

  const deliveryName = document.getElementById('deliveryName').value.trim();
  const deliveryPhone = document.getElementById('deliveryPhone').value.trim();
  const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
  const deliveryCity = document.getElementById('deliveryCity').value.trim();
  const deliveryState = document.getElementById('deliveryState').value.trim();
  const deliveryZip = document.getElementById('deliveryZip').value.trim();
  const deliveryInstructions = document.getElementById('deliveryInstructions').value.trim();
  const deliveryMethod = document.querySelector('.delivery-method.selected')?.dataset.method || 'standard';
  const pm = getPaymentMethod();

  if (!deliveryName || !deliveryPhone || !deliveryAddress || !deliveryCity) {
    showToast('Please fill in all required delivery fields');
    return;
  }

  let paymentPayload;
  if (pm === 'cod') {
    paymentPayload = { method: 'cod' };
  } else {
    const cardHolder = document.getElementById('cardHolder').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('cardExpiry').value.trim();
    const cvv = document.getElementById('cardCvv').value.trim();
    const cardClean = cardNumber.replace(/\s/g, '');
    if (cardClean.length !== 16 || !/^\d{16}$/.test(cardClean)) {
      showToast('Please enter a valid 16-digit card number');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      showToast('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      showToast('Please enter a valid CVV');
      return;
    }
    if (cardHolder.length < 2) {
      showToast('Please enter the card holder name');
      return;
    }
    paymentPayload = { method: 'card', cardHolder, cardNumber, expiry, cvv };
  }

  const btn = document.getElementById('payBtn');
  const text = document.getElementById('payBtnText');
  const loader = document.getElementById('payBtnLoader');
  btn.disabled = true;
  text.classList.add('hidden');
  loader.classList.remove('hidden');

  try {
    const res = await fetch(`${API}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        payment: paymentPayload,
        delivery: {
          fullName: deliveryName,
          phone: deliveryPhone,
          address: deliveryAddress,
          city: deliveryCity,
          state: deliveryState,
          zip: deliveryZip,
          instructions: deliveryInstructions,
          method: deliveryMethod
        }
      })
    });
    const data = await res.json();

    btn.disabled = false;
    text.classList.remove('hidden');
    loader.classList.add('hidden');

    if (data.success) {
      document.getElementById('checkoutOverlay').classList.remove('open');
      showOrderSuccess(data.order);
      updateCartUI({ items: [] });
    } else {
      showToast(data.error || 'Payment failed');
    }
  } catch (e) {
    btn.disabled = false;
    text.classList.remove('hidden');
    loader.classList.add('hidden');
    showToast('Payment processing error. Please try again.');
  }
}

function showOrderSuccess(order) {
  const container = document.getElementById('orderConfirmation');
  const d = order.delivery;
  const p = order.payment;
  const isCod = p.method === 'Cash on Delivery';
  const paymentLine = isCod
    ? '<span>Payment</span><span>Cash on Delivery</span>'
    : '<span>Card</span><span>Visa •••• ' + p.lastFour + '</span>';
  container.innerHTML = `
    <div class="order-id">Order #${order.orderId}</div>
    ${order.items.map(i => `
      <div class="order-detail-item">
        <span>${i.name} × ${i.quantity}</span>
        <span>$${(i.price * i.quantity).toFixed(2)}</span>
      </div>
    `).join('')}
    <div class="order-detail-item">
      <span>Delivery (${d.methodLabel})</span>
      <span>${order.deliveryFee === 0 ? 'Free' : '$' + order.deliveryFee.toFixed(2)}</span>
    </div>
    <div class="order-paid">
      <span>Total</span>
      <span>$${order.total.toFixed(2)}</span>
    </div>
    <div class="order-detail-item" style="margin-top:8px">
      ${paymentLine}
    </div>
    <div class="order-delivery-info">
      <strong>Delivering to:</strong><br>
      ${d.fullName}<br>
      ${d.address}, ${d.city}${d.state ? ', ' + d.state : ''}${d.zip ? ' ' + d.zip : ''}<br>
      📞 ${d.phone}<br>
      ${d.instructions ? '<em>Note: ' + d.instructions + '</em>' : ''}
    </div>
    <div class="order-estimated">
      🚚 Estimated delivery: ${d.estimatedDays}
    </div>
  `;
  document.getElementById('successIcon').textContent = isCod ? '📦' : '✅';
  document.getElementById('successTitle').textContent = isCod ? 'Order Confirmed!' : 'Payment Successful!';
  document.getElementById('successOverlay').classList.add('open');
  saveOrder(order);
}

function closeSuccess(e) {
  if (e && e.target !== document.getElementById('successOverlay')) return;
  document.getElementById('successOverlay').classList.remove('open');
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
}

async function submitContact(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  try {
    const res = await fetch(`${API}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Message sent! We\'ll get back to you soon.');
      document.getElementById('contactForm').reset();
    } else {
      showToast(data.error || 'Failed to send message');
    }
  } catch (e) {
    showToast('Failed to send message. Please try again.');
  }
}

/* Admin Panel */
let adminToken = localStorage.getItem('adminToken');

function showAdminLogin() {
  if (adminToken) {
    showPage('admin');
    loadAdminDashboard();
    return;
  }
  document.getElementById('adminLoginOverlay').classList.add('open');
}

function closeAdminLogin() {
  document.getElementById('adminLoginOverlay').classList.remove('open');
}

async function adminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value.trim();
  try {
    const res = await fetch(`${API}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      closeAdminLogin();
      showPage('admin');
      loadAdminDashboard();
    } else {
      showToast('Invalid credentials');
    }
  } catch (e) {
    showToast('Login failed');
  }
}

function adminLogout() {
  adminToken = null;
  localStorage.removeItem('adminToken');
  showPage('products');
  showToast('Logged out');
}

async function loadAdminDashboard() {
  if (!adminToken) return;
  try {
    const headers = { 'Authorization': `Bearer ${adminToken}` };
    const [statsRes, productsRes] = await Promise.all([
      fetch(`${API}/api/admin/dashboard`, { headers }),
      fetch(`${API}/api/admin/products`, { headers })
    ]);
    const stats = await statsRes.json();
    const prodData = await productsRes.json();
    document.getElementById('adminStats').innerHTML = `
      <div class="admin-stat-card"><div class="stat-value">${stats.totalProducts}</div><div class="stat-label">Products</div></div>
      <div class="admin-stat-card"><div class="stat-value">${stats.totalOrders}</div><div class="stat-label">Orders</div></div>
      <div class="admin-stat-card"><div class="stat-value">$${stats.totalRevenue.toFixed(2)}</div><div class="stat-label">Revenue</div></div>
      <div class="admin-stat-card"><div class="stat-value">${stats.unreadMessages}</div><div class="stat-label">Unread Messages</div></div>
    `;
    renderAdminProducts(prodData.products);
    loadAdminOrders();
    loadAdminMessages();
  } catch (e) {
    showToast('Failed to load admin data');
  }
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('admin' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

function renderAdminProducts(prods) {
  const container = document.getElementById('adminProducts');
  container.innerHTML = `
    <button class="admin-btn-add" onclick="openAdminProduct()">+ Add Product</button>
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead><tr><th></th><th>Name</th><th>Brand</th><th>Price</th><th>Badge</th><th>Rating</th><th></th></tr></thead>
        <tbody>
          ${prods.map(p => `
            <tr>
              <td><img class="product-thumb" src="${p.image}" alt="" onerror="this.style.display='none'"></td>
              <td><strong>${p.name}</strong></td>
              <td>${p.brand}</td>
              <td>$${p.price.toFixed(2)}</td>
              <td>${p.badge || '—'}</td>
              <td>${p.rating}</td>
              <td>
                <div class="actions">
                  <button class="admin-btn admin-btn-edit" onclick="openAdminProduct(${p.id})">Edit</button>
                  <button class="admin-btn admin-btn-delete" onclick="deleteAdminProduct(${p.id})">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadAdminOrders() {
  try {
    const res = await fetch(`${API}/api/admin/orders`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
    const data = await res.json();
    const container = document.getElementById('adminOrders');
    if (data.orders.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3></div>`;
      return;
    }
    container.innerHTML = `
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Card</th><th>Status</th></tr></thead>
          <tbody>
            ${data.orders.map(o => `
              <tr>
                <td><strong>#${o.orderId}</strong></td>
                <td>${new Date(o.date).toLocaleDateString()}</td>
                <td>${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                <td>$${o.total.toFixed(2)}</td>
                <td>•••• ${o.payment.lastFour}</td>
                <td>
                  <select class="status-select" onchange="updateOrderStatus('${o.orderId}', this.value)">
                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    document.getElementById('adminOrders').innerHTML = '<p>Failed to load orders</p>';
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await fetch(`${API}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ status })
    });
    showToast(`Order #${orderId} updated to ${status}`);
  } catch (e) {
    showToast('Failed to update order');
  }
}

async function loadAdminMessages() {
  try {
    const res = await fetch(`${API}/api/admin/messages`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
    const data = await res.json();
    const container = document.getElementById('adminMessages');
    if (data.messages.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">✉️</div><h3>No messages</h3></div>`;
      return;
    }
    container.innerHTML = `
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Subject</th><th>Message</th></tr></thead>
          <tbody>
            ${data.messages.map(m => `
              <tr class="${m.read ? 'message-read' : ''}">
                <td>${new Date(m.date).toLocaleDateString()}</td>
                <td>${m.name}</td>
                <td><a href="mailto:${m.email}" style="color:var(--primary)">${m.email}</a></td>
                <td class="message-subject" onclick="viewMessage('${m.id}')">${m.subject}</td>
                <td><div class="msg-detail">${m.message.length > 80 ? m.message.slice(0, 80) + '...' : m.message}</div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    document.getElementById('adminMessages').innerHTML = '<p>Failed to load messages</p>';
  }
}

async function viewMessage(id) {
  try {
    await fetch(`${API}/api/admin/messages/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    loadAdminMessages();
  } catch (e) {}
}

function openAdminProduct(id) {
  const overlay = document.getElementById('adminProductOverlay');
  const title = document.getElementById('adminProductModalTitle');
  const form = document.getElementById('adminProductForm');
  form.reset();
  document.getElementById('adminProductId').value = '';
  if (id) {
    title.textContent = 'Edit Product';
    const p = products.find(x => x.id === id);
    if (p) {
      document.getElementById('adminProductId').value = p.id;
      document.getElementById('apName').value = p.name;
      document.getElementById('apBrand').value = p.brand;
      document.getElementById('apPrice').value = p.price;
      document.getElementById('apOrigPrice').value = p.originalPrice || '';
      document.getElementById('apImage').value = p.image || '';
      document.getElementById('apBadge').value = p.badge || '';
      document.getElementById('apDescription').value = p.description || '';
      document.getElementById('apSpecs').value = p.specs ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '';
      document.getElementById('apRating').value = p.rating || '';
      document.getElementById('apReviews').value = p.reviews || '';
    }
  } else {
    title.textContent = 'Add Product';
  }
  overlay.classList.add('open');
}

function closeAdminProduct() {
  document.getElementById('adminProductOverlay').classList.remove('open');
}

async function saveAdminProduct(e) {
  e.preventDefault();
  const id = document.getElementById('adminProductId').value;
  const specsText = document.getElementById('apSpecs').value.trim();
  const specs = {};
  if (specsText) {
    specsText.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
  }
  const body = {
    name: document.getElementById('apName').value.trim(),
    brand: document.getElementById('apBrand').value.trim(),
    price: document.getElementById('apPrice').value,
    originalPrice: document.getElementById('apOrigPrice').value || null,
    image: document.getElementById('apImage').value.trim(),
    badge: document.getElementById('apBadge').value.trim() || null,
    description: document.getElementById('apDescription').value.trim(),
    specs,
    rating: document.getElementById('apRating').value || 0,
    reviews: document.getElementById('apReviews').value || 0
  };
  try {
    const url = id ? `${API}/api/admin/products/${id}` : `${API}/api/admin/products`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      showToast(id ? 'Product updated' : 'Product added');
      closeAdminProduct();
      await loadProducts();
      await loadAdminDashboard();
    } else {
      showToast(data.error || 'Failed to save');
    }
  } catch (e) {
    showToast('Failed to save product');
  }
}

async function deleteAdminProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch(`${API}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted');
      await loadProducts();
      await loadAdminDashboard();
    }
  } catch (e) {
    showToast('Failed to delete');
  }
}

/* Override showPage to load admin dashboard */
const _origShowPage = showPage;
showPage = function(page) {
  _origShowPage(page);
  if (page === 'admin') loadAdminDashboard();
};

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
