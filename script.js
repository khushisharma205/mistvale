const PRODUCTS = [
  { id: 101, name: 'Assam Breakfast Black Tea', category: 'Black', price: 349, stock: 40, image: 'images/p101.svg', desc: 'Strong, malty CTC tea from Upper Assam estates. Perfect with milk and a little sugar in the morning.' },
  { id: 102, name: 'Darjeeling First Flush', category: 'Black', price: 1299, stock: 12, image: 'images/p102.svg', desc: 'Delicate, floral spring harvest leaves with a muscatel note. Best without milk.', rating: 4.8, reviews: 128 },
  { id: 103, name: 'Kashmiri Kahwa', category: 'Green', price: 549, stock: 25, image: 'images/p103.svg', desc: 'Green tea with saffron, cardamom, cinnamon and almond flakes.' },
  { id: 104, name: 'Masala Chai Blend', category: 'Black', price: 399, stock: 60, image: 'images/p104.svg', desc: 'Bold Assam leaves with ginger, cardamom, clove and black pepper. Our bestseller.', rating: 4.7, reviews: 342 },
  { id: 105, name: 'Nilgiri Green Tea', category: 'Green', price: 449, stock: 30, image: 'images/p105.svg', desc: 'Smooth, grassy green tea from the Blue Mountains of the south.' },
  { id: 106, name: 'Chamomile & Tulsi', category: 'Herbal', price: 499, stock: 18, image: 'images/p106.svg', desc: 'Caffeine-free calming blend of chamomile flowers and holy basil.' },
  { id: 107, name: 'Hibiscus Rose Infusion', category: 'Herbal', price: 599, stock: 0, image: 'images/p107.svg', desc: 'Tangy hibiscus with rose petals. Lovely iced.' },
  { id: 108, name: "Tea Lover's Sampler Gift Box", category: 'Gifts', price: 1899, stock: 9, image: 'images/p108.svg', desc: 'Six of our favourite teas in a wooden gift box with a brewing guide.' }
];

const API = {
  search: function (query) {
    const q = String(query).trim().toLowerCase();
    const delay = Math.max(120, 900 - q.length * 140);
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(PRODUCTS.filter(function (p) {
          return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
        }).map(function (p) { return p.id; }));
      }, delay);
    });
  },
  checkPincode: function (pin) {
    const zones = { '73': 2, '70': 3, '71': 3, '11': 4, '40': 4, '56': 5, '60': 5, '50': 5 };
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (!/^[1-9][0-9]{5}$/.test(String(pin))) return reject(new Error('INVALID_PINCODE'));
        const days = zones[String(pin).slice(0, 2)];
        resolve(days ? { serviceable: true, days: days } : { serviceable: false });
      }, 400 + Math.random() * 600);
    });
  }
};

const state = {
  category: 'all',
  query: '',
  searchIds: null,
  sort: 'featured',
  cart: loadCart(),
  appliedCoupon: null,
  liked: new Set(loadLiked()),
  pinToken: 0,
  searchToken: 0,
  lastToastTimer: null
};

const elements = {
  grid: document.getElementById('product-grid'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartOverlay: document.getElementById('cart-overlay'),
  cartCount: document.getElementById('cart-count'),
  cartItems: document.getElementById('cart-items'),
  cartTotals: document.getElementById('cart-totals'),
  shippingAlert: document.getElementById('shipping-alert'),
  couponInput: document.getElementById('coupon-input'),
  quickview: document.getElementById('quickview'),
  quickviewContent: document.getElementById('quickview-content'),
  toast: document.getElementById('toast'),
  deliveryPin: document.getElementById('delivery-pin'),
  deliveryResult: document.getElementById('delivery-result'),
  newsletterMessage: document.getElementById('newsletter-message'),
  headerSearch: document.getElementById('header-search'),
  sortSelect: document.getElementById('sort-select')
};

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem('mv_cart') || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    return [];
  }
}

function loadLiked() {
  try {
    const raw = JSON.parse(localStorage.getItem('mv_liked') || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('mv_cart', JSON.stringify(state.cart));
}

function saveLiked() {
  localStorage.setItem('mv_liked', JSON.stringify(Array.from(state.liked)));
}

function formatMoney(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getProductById(id) {
  return PRODUCTS.find((product) => Number(product.id) === Number(id));
}

function getCartSubtotal() {
  return state.cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    if (!product) return sum;
    return sum + (Number(product.price) * Number(item.qty));
  }, 0);
}

function getEligibleSubtotal() {
  return state.cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    if (!product || product.category === 'Gifts') return sum;
    return sum + (Number(product.price) * Number(item.qty));
  }, 0);
}

function getDiscount() {
  if (state.appliedCoupon !== 'WELCOME10') return 0;
  const subtotal = getCartSubtotal();
  const eligibleSubtotal = getEligibleSubtotal();
  if (subtotal < 399 || eligibleSubtotal === 0) return 0;
  return Math.min(eligibleSubtotal * 0.10, 150);
}

function getShipping() {
  const afterDiscount = getCartSubtotal() - getDiscount();
  return afterDiscount >= 599 ? 0 : 49;
}

function updateCartCount() {
  const totalQty = state.cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  elements.cartCount.textContent = String(totalQty);
  elements.cartCount.setAttribute('aria-label', `${totalQty} items in cart`);
}

function renderHeader() {
  elements.headerSearch.value = state.query;
  elements.sortSelect.value = state.sort;
  updateCartCount();
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.category === state.category);
  });
}

function getVisibleProducts() {
  let list = PRODUCTS.filter((product) => {
    if (state.category !== 'all' && product.category !== state.category) return false;
    return true;
  });

  if (state.searchIds) {
    const hits = new Set(state.searchIds);
    list = list.filter((product) => hits.has(product.id));
  }

  return [...list].sort((a, b) => {
    if (Number(a.stock) === 0 && Number(b.stock) !== 0) return 1;
    if (Number(b.stock) === 0 && Number(a.stock) !== 0) return -1;
    switch (state.sort) {
      case 'low':
        return Number(a.price) - Number(b.price);
      case 'high':
        return Number(b.price) - Number(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return Number(a.id) - Number(b.id);
    }
  });
}

function renderGrid() {
  const list = getVisibleProducts();
  const emptyState = document.getElementById('empty-state');

  if (!list.length) {
    elements.grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  elements.grid.innerHTML = list.map((product) => {
    const liked = state.liked.has(product.id) ? 'true' : 'false';
    const stock = Number(product.stock);
    const rating = product.rating ? `
      <div class="rating-row" aria-label="Rated ${product.rating} out of 5 by ${product.reviews} reviews">
        <span class="stars">★★★★★</span>
        <span>(${product.reviews})</span>
      </div>
    ` : '<div class="rating-row muted">No reviews yet</div>';
    return `
      <article class="product-card" data-id="${product.id}">
        <button class="wishlist-btn" type="button" data-action="toggle-like" data-id="${product.id}" aria-label="Save ${product.name} to wishlist" aria-pressed="${liked}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20.2 4.8 13a4.5 4.5 0 0 1 6.3-6.4L12 7l.9-1.4a4.5 4.5 0 1 1 6.3 6.4L12 20.2z"></path>
          </svg>
        </button>
        <div class="product-image-wrap">
          <img class="product-image" src="${product.image}" alt="${product.name} tea pack" loading="lazy" width="320" height="320" data-action="open-quickview" data-id="${product.id}">
        </div>
        ${stock === 0 ? '<span class="badge sold-out">Sold out</span>' : ''}
        <div class="product-body">
          <div class="product-meta">
            <h3 class="product-name">${product.name}</h3>
          </div>
          <div class="product-desc">${product.desc}</div>
          ${rating}
          <div class="product-footer">
            <div class="price-group">
              <span class="price">${formatMoney(product.price)}</span>
              <span class="stock">${stock === 0 ? 'Sold out' : `${stock} in stock`}</span>
            </div>
            <button class="product-add" type="button" data-action="add-cart" data-id="${product.id}" ${stock === 0 ? 'disabled' : ''}>Add</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderCart() {
  const subtotal = getCartSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = Math.round(subtotal - discount + shipping);

  elements.couponInput.value = state.appliedCoupon || '';
  elements.cartItems.innerHTML = state.cart.length ? state.cart.map((item) => {
    const product = getProductById(item.id);
    if (!product) return '';
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <div class="small">${formatMoney(product.price)} each</div>
          <div class="qty-control">
            <button class="qty-button" type="button" data-action="decrement" data-id="${item.id}" aria-label="Decrease quantity of ${product.name}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-button" type="button" data-action="increment" data-id="${item.id}" aria-label="Increase quantity of ${product.name}">+</button>
          </div>
        </div>
        <div>
          <div class="price" style="font-size:1.1rem; margin-bottom: 8px;">${formatMoney(product.price * item.qty)}</div>
          <a href="#" class="remove-link" data-action="remove-item" data-id="${item.id}">Remove</a>
        </div>
      </div>
    `;
  }).join('') : '<p>Your cart is empty.</p>';

  elements.cartTotals.innerHTML = `
    <div class="tot-row"><span>Subtotal</span><strong>${formatMoney(subtotal)}</strong></div>
    <div class="tot-row"><span>Discount</span><strong>${formatMoney(discount)}</strong></div>
    <div class="tot-row"><span>Shipping</span><strong>${shipping === 0 ? 'Free' : formatMoney(shipping)}</strong></div>
    <div class="tot-row" style="font-size:16px; color:var(--ink);"><span>Total</span><strong>${formatMoney(total)}</strong></div>
  `;

  const remaining = Math.max(0, 599 - (subtotal - discount));
  elements.shippingAlert.textContent = subtotal - discount >= 599
    ? 'Free shipping unlocked.'
    : `Add ${formatMoney(remaining)} more for free shipping.`;
}

function render() {
  renderGrid();
  renderHeader();
  renderCart();
}

function showToast(message) {
  const toast = elements.toast;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(state.lastToastTimer);
  state.lastToastTimer = setTimeout(() => toast.classList.remove('show'), 2100);
}

function addToCart(id, qty = 1) {
  const product = getProductById(id);
  if (!product) return;
  if (product.stock === 0) {
    showToast('This tea is sold out.');
    return;
  }

  const existing = state.cart.find((item) => Number(item.id) === Number(id));
  const currentQty = existing ? Number(existing.qty) : 0;
  const cap = Math.min(5, Number(product.stock));
  const nextQty = currentQty + qty;

  if (nextQty > cap) {
    showToast(`You can add up to ${cap} of this tea.`);
    return;
  }

  if (existing) {
    existing.qty = nextQty;
  } else {
    state.cart.push({ id: Number(product.id), qty: qty });
  }

  saveCart();
  render();
  showToast(`${product.name} added to cart.`);
}

function incrementQty(id) {
  const product = getProductById(id);
  if (!product) return;
  const current = state.cart.find((item) => Number(item.id) === Number(id));
  if (!current) return;
  const newQty = Number(current.qty) + 1;
  const max = Math.min(5, Number(product.stock));
  if (newQty > max) {
    showToast(`You can purchase up to ${max} of this tea.`);
    return;
  }
  current.qty = newQty;
  saveCart();
  render();
}

function decrementQty(id) {
  const current = state.cart.find((item) => Number(item.id) === Number(id));
  if (!current) return;
  if (current.qty <= 1) {
    state.cart = state.cart.filter((item) => Number(item.id) !== Number(id));
  } else {
    current.qty = Math.max(1, Number(current.qty) - 1);
  }
  saveCart();
  render();
}

function removeItem(id) {
  state.cart = state.cart.filter((item) => Number(item.id) !== Number(id));
  saveCart();
  render();
}

function applyCoupon() {
  const code = elements.couponInput.value.trim();
  const normalized = code.toUpperCase();

  if (!normalized) {
    if (state.appliedCoupon) {
      state.appliedCoupon = null;
      render();
      showToast('Coupon removed.');
    } else {
      showToast('Please enter a coupon code.');
    }
    return;
  }

  if (state.appliedCoupon && normalized === state.appliedCoupon) {
    showToast('WELCOME10 is already applied.');
    return;
  }

  if (state.appliedCoupon && normalized !== state.appliedCoupon) {
    showToast('Only one coupon can be used at a time.');
    return;
  }

  if (normalized !== 'WELCOME10') {
    showToast('Coupon code not recognised.');
    return;
  }

  const subtotal = getCartSubtotal();
  const eligibleSubtotal = getEligibleSubtotal();
  if (subtotal < 399) {
    const needed = 399 - subtotal;
    showToast(`Add ${formatMoney(needed)} more to use WELCOME10`);
    return;
  }
  if (eligibleSubtotal === 0) {
    showToast('WELCOME10 does not apply to gift boxes');
    return;
  }

  state.appliedCoupon = 'WELCOME10';
  render();
  showToast('WELCOME10 applied.');
}

function openCart() {
  elements.cartDrawer.classList.add('open');
  elements.cartOverlay.classList.add('open');
  elements.cartOverlay.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  elements.cartDrawer.classList.remove('open');
  elements.cartOverlay.classList.remove('open');
  elements.cartOverlay.setAttribute('aria-hidden', 'true');
}

function openQuickView(id) {
  const product = getProductById(id);
  if (!product) return;
  elements.quickviewContent.innerHTML = `
    <div class="quickview-image-wrap">
      <img class="quickview-image" src="${product.image}" alt="${product.name} tea pack" width="400" height="400">
    </div>
    <div class="quickview-body">
      <p class="eyebrow" style="background: rgba(31,61,43,0.05); color: var(--tea-green); border-color: rgba(31,61,43,0.08); margin-bottom: 8px;">${product.category}</p>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="price" style="margin-bottom: 12px;">${formatMoney(product.price)}</div>
      <button class="btn" type="button" data-action="add-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>Add to cart</button>
    </div>
  `;
  elements.quickview.classList.add('open');
  elements.quickview.setAttribute('aria-hidden', 'false');
}

function closeQuickView() {
  elements.quickview.classList.remove('open');
  elements.quickview.setAttribute('aria-hidden', 'true');
}

function handlePrimaryClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;

  switch (action) {
    case 'toggle-like':
      if (state.liked.has(Number(id))) state.liked.delete(Number(id)); else state.liked.add(Number(id));
      saveLiked();
      render();
      break;
    case 'add-cart':
      addToCart(id);
      break;
    case 'open-quickview':
      openQuickView(id);
      break;
    case 'increment':
      incrementQty(id);
      break;
    case 'decrement':
      decrementQty(id);
      break;
    case 'remove-item':
      removeItem(id);
      break;
    default:
      break;
  }
}

function handleSearchInput(event) {
  state.query = event.target.value;
  const myToken = ++state.searchToken;
  if (!state.query.trim()) {
    state.searchIds = null;
    render();
    return;
  }
  API.search(state.query).then((ids) => {
    if (myToken !== state.searchToken) return;
    state.searchIds = ids;
    render();
  });
}

function handleDeliveryCheck() {
  const pin = elements.deliveryPin.value.trim();
  const token = ++state.pinToken;
  const result = elements.deliveryResult;

  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    result.textContent = 'Please enter a valid 6-digit pincode.';
    result.className = 'delivery-result error';
    return;
  }

  result.textContent = 'Checking…';
  result.className = 'delivery-result';
  document.getElementById('check-pin').disabled = true;

  API.checkPincode(pin)
    .then((response) => {
      if (token !== state.pinToken) return;
      if (response.serviceable) {
        result.textContent = `Delivery to ${pin} in ${response.days} working day${response.days === 1 ? '' : 's'}.`;
        result.className = 'delivery-result success';
      } else {
        result.textContent = `Sorry, we do not deliver to ${pin} yet.`;
        result.className = 'delivery-result error';
      }
    })
    .catch((error) => {
      if (token !== state.pinToken) return;
      if (error && error.message === 'INVALID_PINCODE') {
        result.textContent = 'Please enter a valid 6-digit pincode.';
      } else {
        result.textContent = 'We could not check delivery right now. Please try again.';
      }
      result.className = 'delivery-result error';
    })
    .finally(() => {
      if (token === state.pinToken) {
        document.getElementById('check-pin').disabled = false;
      }
    });
}

function handleNewsletterSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('newsletter-email').value.trim();
  const message = elements.newsletterMessage;
  if (!email || !email.includes('@')) {
    message.textContent = 'Please enter a valid email address.';
    message.className = 'form-message error';
    return;
  }
  message.textContent = 'Thanks, you are on the list for fresh tea notes.';
  message.className = 'form-message success';
  event.target.reset();
}

function handleCheckout() {
  const form = document.getElementById('checkout-form');
  form.elements.items.value = JSON.stringify(state.cart.map((item) => ({ id: Number(item.id), qty: Number(item.qty) })));
  form.elements.coupon.value = state.appliedCoupon || '';
  form.submit();
}

function wireEvents() {
  document.addEventListener('click', handlePrimaryClick);
  document.getElementById('header-search').addEventListener('input', handleSearchInput);
  document.getElementById('category-filters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-category]');
    if (!chip) return;
    state.category = chip.dataset.category;
    render();
  });
  document.getElementById('sort-select').addEventListener('change', (event) => {
    state.sort = event.target.value;
    render();
  });
  document.getElementById('cart-button').addEventListener('click', openCart);
  document.getElementById('close-cart').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('check-pin').addEventListener('click', handleDeliveryCheck);
  document.getElementById('delivery-pin').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleDeliveryCheck();
  });
  document.getElementById('apply-coupon').addEventListener('click', applyCoupon);
  document.getElementById('coupon-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyCoupon();
  });
  document.getElementById('checkout-button').addEventListener('click', handleCheckout);
  document.getElementById('newsletter-form').addEventListener('submit', handleNewsletterSubmit);
  document.getElementById('close-quickview').addEventListener('click', closeQuickView);
  document.getElementById('quickview').addEventListener('click', (event) => {
    if (event.target === document.getElementById('quickview')) closeQuickView();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
      closeQuickView();
    }
  });
}

function makeSchema() {
  const faq = [
    { question: 'How long does delivery take?', answer: '2 to 5 working days depending on your pincode. Use the delivery check to see yours.' },
    { question: 'Can I return tea?', answer: 'Unopened packs can be returned within 7 days of delivery. Opened tea cannot be returned for hygiene reasons.' },
    { question: 'How should I store my tea?', answer: 'In an airtight container, away from light, heat and strong smells. It tastes best within 6 months of opening.' },
    { question: 'Is Chamomile & Tulsi caffeine-free?', answer: 'Yes, it is a caffeine-free herbal blend.' },
    { question: 'Do you ship outside India?', answer: 'Not yet. We currently deliver within India only.' },
    { question: 'Can I send tea as a gift?', answer: "Yes. The Tea Lover's Sampler comes in a wooden gift box with a brewing guide." }
  ];

  const productSchema = PRODUCTS.map((product) => {
    const offer = {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    };
    const base = {
      '@type': 'Product',
      name: product.name,
      image: `https://mistvale.example/${product.image}`,
      description: product.desc,
      sku: String(product.id),
      brand: { '@type': 'Brand', name: 'Mistvale Tea Co.' },
      offers: offer
    };
    if (product.rating) {
      base.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews
      };
    }
    return base;
  });

  const faqJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  const orgJson = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Mistvale Tea Co.',
    url: 'https://mistvale.example/',
    logo: 'https://mistvale.example/images/logo.svg',
    telephone: '+91 90000 12345',
    email: 'hello@mistvale.example',
    foundingDate: '2019',
    sameAs: ['https://instagram.com/mistvale.example'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Hill Cart Road',
      addressLocality: 'Siliguri',
      addressRegion: 'West Bengal',
      postalCode: '734001',
      addressCountry: 'IN'
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({ '@graph': [orgJson, ...productSchema, faqJson] });
  document.head.appendChild(script);
}

function init() {
  wireEvents();
  render();
  makeSchema();
}

init();
