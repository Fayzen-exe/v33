// =============================================
// FIZZA'S COLLECTION - Main JavaScript
// Elegance in Every Style
// =============================================

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAalAeem3canyfoGDJI0vuot9-REHEZLUA",
  authDomain: "fizzacollection.firebaseapp.com",
  projectId: "fizzacollection",
  storageBucket: "fizzacollection.firebasestorage.app",
  messagingSenderId: "766834103618",
  appId: "1:766834103618:web:8abf4a5cf410fb3894e4db"
};

// ====== FIREBASE INIT ======
let db, auth, googleProvider;
let firebaseReady = false;

async function initFirebase() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    firebaseReady = true;

    window._fb = { collection, addDoc, getDocs, query, orderBy, serverTimestamp, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };

    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      updateAuthUI();
    });

    console.log("Firebase initialized ✓");
  } catch (err) {
    console.warn("Firebase not available:", err.message);
  }
}

// ====== STATE ======
let cart = JSON.parse(localStorage.getItem('fizza_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('fizza_wishlist') || '[]');
let currentUser = null;
let currentProduct = null;

// ====== SAMPLE PRODUCTS DATA ======
const products = [
  { id: 1, name: "Ivory Silk Kurti", category: "shirts", price: 2800, oldPrice: 3500, image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e2c?w=500&q=80", badge: "new", desc: "Elegant ivory silk kurti with delicate embroidery, perfect for festive occasions.", sizes: ["XS","S","M","L","XL"] },
  { id: 2, name: "Gold Chain Necklace", category: "jewellery", price: 4500, image: "https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=500&q=80", badge: "trending", desc: "Luxurious 22K gold-plated chain necklace with intricate craftsmanship.", sizes: [] },
  { id: 3, name: "Blush Formal Trousers", category: "trousers", price: 3200, oldPrice: 4000, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80", badge: "sale", desc: "Tailored blush-tone formal trousers for a sophisticated, modern look.", sizes: ["XS","S","M","L","XL","XXL"] },
  { id: 4, name: "Embroidered 3-Piece Suit", category: "3piece", price: 12500, image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&q=80", badge: "featured", desc: "Handcrafted 3-piece lawn suit with elegant embroidery — a timeless classic.", sizes: ["S","M","L","XL"] },
  { id: 5, name: "Pearl Drop Earrings", category: "jewellery", price: 1800, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80", badge: "new", desc: "Graceful freshwater pearl drop earrings, perfect for every occasion.", sizes: [] },
  { id: 6, name: "Nude Leather Handbag", category: "handbags", price: 6800, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80", badge: "trending", desc: "Premium vegan leather structured handbag in a timeless nude tone.", sizes: [] },
  { id: 7, name: "Floral Chiffon Shirt", category: "shirts", price: 2200, image: "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?w=500&q=80", badge: "new", desc: "Lightweight chiffon shirt with delicate floral prints — effortlessly feminine.", sizes: ["XS","S","M","L","XL"] },
  { id: 8, name: "Mini Crossbody Bag", category: "handbags", price: 3800, oldPrice: 4800, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80", badge: "sale", desc: "Compact crossbody bag with adjustable strap, ideal for everyday chic.", sizes: [] },
  { id: 9, name: "Velvet Wide-Leg Trousers", category: "trousers", price: 4200, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80", badge: "featured", desc: "Luxurious velvet wide-leg trousers for a bold, fashion-forward statement.", sizes: ["XS","S","M","L"] },
  { id: 10, name: "Rose Gold Bracelet Set", category: "jewellery", price: 2600, image: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&q=80", badge: "trending", desc: "Set of 3 stackable rose gold bracelets, perfect for layering.", sizes: [] },
  { id: 11, name: "Embellished Formal Shirt", category: "shirts", price: 3600, image: "https://images.unsplash.com/photo-1561861422-a549073e547a?w=500&q=80", badge: "new", desc: "Intricately embellished formal shirt for weddings and special events.", sizes: ["S","M","L","XL"] },
  { id: 12, name: "Classic Tote Bag", category: "handbags", price: 5200, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&q=80", badge: "featured", desc: "Spacious structured tote bag crafted from premium faux leather.", sizes: [] },
];

// ====== LOADING SCREEN ======
window.addEventListener('load', () => {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('hidden');
  }, 1800);
  initFirebase();
  renderProducts();
  updateCartUI();
  updateWishlistUI();
  initScrollReveal();
  initNavbar();
});

// ====== NAVBAR ======
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
      document.getElementById('back-to-top')?.classList.add('visible');
    } else {
      navbar?.classList.remove('scrolled');
      document.getElementById('back-to-top')?.classList.remove('visible');
    }
  });

  // Highlight active nav link
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });
}

// ====== MOBILE MENU ======
function openMobileMenu() {
  document.getElementById('mobile-menu')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ====== RENDER PRODUCTS ======
function renderProducts(filter = 'all', containerId = 'featured-products') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  container.innerHTML = filtered.map(product => createProductCardHTML(product)).join('');

  // Attach events
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) openProductModal(+card.dataset.id);
    });
  });
}

function createProductCardHTML(product) {
  const isWishlisted = wishlist.some(w => w.id === product.id);
  return `
    <div class="product-card reveal" data-id="${product.id}">
      <div class="product-card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge}</span>` : ''}
        <div class="product-card-actions">
          <button class="product-action-btn ${isWishlisted ? 'wishlisted' : ''}" onclick="toggleWishlist(${product.id}, event)" title="Wishlist">
            <i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i>
          </button>
          <button class="product-action-btn" onclick="openProductModal(${product.id})" title="Quick View">
            <i class="far fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-card-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price-row">
          <div>
            <span class="product-price">Rs. ${product.price.toLocaleString()}</span>
            ${product.oldPrice ? `<span class="product-price-old"> Rs. ${product.oldPrice.toLocaleString()}</span>` : ''}
          </div>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id}, event)">Add</button>
        </div>
      </div>
    </div>
  `;
}

// ====== PRODUCT FILTER ======
function filterProducts(btn, filter, containerId = 'featured-products') {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filter, containerId);
  setTimeout(initScrollReveal, 50);
}

// ====== PRODUCT MODAL ======
function openProductModal(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;

  document.getElementById('modal-product-image').src = currentProduct.image;
  document.getElementById('modal-product-category').textContent = currentProduct.category;
  document.getElementById('modal-product-title').textContent = currentProduct.name;
  document.getElementById('modal-product-price').textContent = `Rs. ${currentProduct.price.toLocaleString()}`;
  document.getElementById('modal-product-desc').textContent = currentProduct.desc;

  const sizesContainer = document.getElementById('modal-product-sizes');
  if (currentProduct.sizes?.length > 0) {
    sizesContainer.innerHTML = `
      <div class="size-label">Select Size</div>
      <div class="size-options">
        ${currentProduct.sizes.map(s => `<button class="size-option" onclick="selectSize(this)">${s}</button>`).join('')}
      </div>
    `;
  } else {
    sizesContainer.innerHTML = '';
  }

  openModal('product-modal');
}

function selectSize(btn) {
  document.querySelectorAll('#modal-product-sizes .size-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function addCurrentToCart() {
  if (!currentProduct) return;
  const selectedSize = document.querySelector('#modal-product-sizes .size-option.selected');
  if (currentProduct.sizes?.length > 0 && !selectedSize) {
    showToast('Please select a size', 'error');
    return;
  }
  addToCartById(currentProduct.id, selectedSize?.textContent || null);
  closeModal('product-modal');
}

// ====== CART ======
function addToCart(id, event) {
  event?.stopPropagation();
  addToCartById(id, null);
}

function addToCartById(id, size) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1, size });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart! 🛍️`, 'success');
}

function removeFromCart(id, size) {
  cart = cart.filter(item => !(item.id === id && item.size === size));
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateQty(id, size, delta) {
  const item = cart.find(i => i.id === id && i.size === size);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('fizza_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items-list');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="far fa-shopping-bag"></i>
        <p>Your cart is empty</p>
        <button class="btn-primary" onclick="closeCart()">Continue Shopping</button>
      </div>
    `;
    updateCartTotals();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-image" src="${item.image}" alt="${item.name}">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-variant">${item.size ? `Size: ${item.size}` : ''}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id},'${item.size}',-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id},'${item.size}',1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <span class="cart-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</span>
        <button class="cart-remove" onclick="removeFromCart(${item.id},'${item.size}')"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `).join('');

  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const total = subtotal + shipping;

  document.getElementById('cart-subtotal')?.querySelector('span:last-child') && 
    (document.getElementById('cart-subtotal').querySelector('span:last-child').textContent = `Rs. ${subtotal.toLocaleString()}`);
  document.getElementById('cart-total-amount') && 
    (document.getElementById('cart-total-amount').textContent = `Rs. ${total.toLocaleString()}`);
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ====== WISHLIST ======
function toggleWishlist(id, event) {
  event?.stopPropagation();
  const product = products.find(p => p.id === id);
  if (!product) return;

  const idx = wishlist.findIndex(w => w.id === id);
  if (idx === -1) {
    wishlist.push(product);
    showToast(`${product.name} added to wishlist ♡`, 'success');
  } else {
    wishlist.splice(idx, 1);
    showToast(`Removed from wishlist`, 'success');
  }
  localStorage.setItem('fizza_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
  renderProducts(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  setTimeout(initScrollReveal, 50);
}

function updateWishlistUI() {
  document.querySelectorAll('.wishlist-count-badge').forEach(b => {
    b.textContent = wishlist.length;
    b.style.display = wishlist.length > 0 ? 'flex' : 'none';
  });
}

// ====== MODALS ======
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

// ====== AUTH MODAL ======
let authMode = 'login';

function openAuthModal(mode = 'login') {
  authMode = mode;
  openModal('auth-modal');
  switchAuthTab(mode);
}

function switchAuthTab(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === mode));
  document.getElementById('auth-login-form').style.display = mode === 'login' ? 'flex' : 'none';
  document.getElementById('auth-signup-form').style.display = mode === 'signup' ? 'flex' : 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!firebaseReady) { showToast('Service not available', 'error'); return; }

  try {
    await window._fb.signInWithEmailAndPassword(auth, email, password);
    closeModal('auth-modal');
    showToast('Welcome back! 👋', 'success');
  } catch (err) {
    showToast(err.message.replace('Firebase: ', ''), 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  if (!firebaseReady) { showToast('Service not available', 'error'); return; }

  try {
    await window._fb.createUserWithEmailAndPassword(auth, email, password);
    closeModal('auth-modal');
    showToast(`Welcome, ${name}! 🎉`, 'success');
  } catch (err) {
    showToast(err.message.replace('Firebase: ', ''), 'error');
  }
}

async function handleGoogleLogin() {
  if (!firebaseReady) { showToast('Service not available', 'error'); return; }
  try {
    await window._fb.signInWithPopup(auth, googleProvider);
    closeModal('auth-modal');
    showToast('Welcome! Signed in with Google ✓', 'success');
  } catch (err) {
    showToast(err.message.replace('Firebase: ', ''), 'error');
  }
}

async function handleLogout() {
  if (!firebaseReady) return;
  try {
    await window._fb.signOut(auth);
    showToast('Signed out successfully', 'success');
    closeUserDropdown();
  } catch (err) {
    showToast('Error signing out', 'error');
  }
}

function updateAuthUI() {
  const loginBtn = document.getElementById('nav-login-btn');
  const userBtn = document.getElementById('nav-user-btn');
  const userNameEl = document.getElementById('user-display-name');

  if (currentUser) {
    loginBtn?.classList.add('hidden');
    userBtn?.classList.remove('hidden');
    if (userNameEl) userNameEl.textContent = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  } else {
    loginBtn?.classList.remove('hidden');
    userBtn?.classList.add('hidden');
  }
}

function toggleUserDropdown() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

function closeUserDropdown() {
  document.getElementById('user-dropdown')?.classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-btn-wrap')) closeUserDropdown();
});

// ====== CHECKOUT ======
function openCheckout() {
  if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
  closeCart();

  // Populate order summary
  const summary = document.getElementById('checkout-order-summary');
  if (summary) {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = 200;
    summary.innerHTML = `
      ${cart.map(i => `<div class="order-summary-item"><span>${i.name} × ${i.qty}</span><span>Rs. ${(i.price * i.qty).toLocaleString()}</span></div>`).join('')}
      <div class="order-summary-item"><span>Shipping</span><span>Rs. 200</span></div>
      <div class="order-summary-total"><span>Total</span><span>Rs. ${(subtotal + shipping).toLocaleString()}</span></div>
    `;
  }

  openModal('checkout-modal');
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const name = document.getElementById('order-name').value;
  const phone = document.getElementById('order-phone').value;
  const address = document.getElementById('order-address').value;
  const city = document.getElementById('order-city').value;

  const orderData = {
    customerName: name,
    phone,
    address,
    city,
    items: cart,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0) + 200,
    status: 'pending',
    userId: currentUser?.uid || 'guest',
    userEmail: currentUser?.email || 'guest',
    createdAt: new Date().toISOString()
  };

  if (firebaseReady) {
    try {
      const { collection, addDoc, serverTimestamp } = window._fb;
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Order save error:', err);
    }
  }

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  closeModal('checkout-modal');
  openModal('success-modal');
}

// ====== SEARCH ======
function openSearch() {
  document.getElementById('search-overlay')?.classList.add('open');
  document.getElementById('search-input')?.focus();
  document.body.style.overflow = 'hidden';
}

function closeSearch() {
  document.getElementById('search-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  renderSearchResults([]);
}

function handleSearch(value) {
  if (!value.trim()) { renderSearchResults([]); return; }
  const results = products.filter(p =>
    p.name.toLowerCase().includes(value.toLowerCase()) ||
    p.category.toLowerCase().includes(value.toLowerCase())
  );
  renderSearchResults(results);
}

function renderSearchResults(results) {
  const container = document.getElementById('search-results');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = results.map(p => `
    <div class="product-card" onclick="closeSearch(); openProductModal(${p.id})" style="cursor:pointer">
      <div class="product-card-image" style="height:180px">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-card-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">Rs. ${p.price.toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

// ====== NEWSLETTER ======
function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email')?.value;
  if (!email) return;
  showToast('Thank you for subscribing! 🌸', 'success');
  document.getElementById('newsletter-email').value = '';
}

// ====== TOAST ======
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ====== SCROLL REVEAL ======
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('visible');
    observer.observe(el);
  });
}

// ====== BACK TO TOP ======
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== SHOP PAGE FILTER ======
function shopFilter(btn, filter) {
  document.querySelectorAll('.shop-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filter, 'shop-products-grid');
  setTimeout(initScrollReveal, 50);
}

function filterByPrice(val) {
  document.getElementById('price-display').textContent = `Rs. ${parseInt(val).toLocaleString()}`;
  const filter = document.querySelector('.shop-filter-btn.active')?.dataset.filter || 'all';
  const filtered = (filter === 'all' ? products : products.filter(p => p.category === filter))
    .filter(p => p.price <= parseInt(val));

  const container = document.getElementById('shop-products-grid');
  if (!container) return;
  container.innerHTML = filtered.map(p => createProductCardHTML(p)).join('');
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) openProductModal(+card.dataset.id);
    });
  });
  setTimeout(initScrollReveal, 50);
}

function sortProducts(val) {
  const filter = document.querySelector('.shop-filter-btn.active')?.dataset.filter || 'all';
  let sorted = filter === 'all' ? [...products] : products.filter(p => p.category === filter);

  if (val === 'price-low') sorted.sort((a, b) => a.price - b.price);
  else if (val === 'price-high') sorted.sort((a, b) => b.price - a.price);
  else if (val === 'newest') sorted = sorted.filter(p => p.badge === 'new').concat(sorted.filter(p => p.badge !== 'new'));

  const container = document.getElementById('shop-products-grid');
  if (!container) return;
  container.innerHTML = sorted.map(p => createProductCardHTML(p)).join('');
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) openProductModal(+card.dataset.id);
    });
  });
  setTimeout(initScrollReveal, 50);
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.id && closeModal(e.target.id);
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSearch();
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    closeCart();
    closeMobileMenu();
  }
});
