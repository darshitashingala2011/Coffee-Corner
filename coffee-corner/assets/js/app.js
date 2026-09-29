/**
 * ============================================================================
 * COFFEE CORNER - GLOBAL APPLICATION & UI CONTROLLER (app.js)
 * Manages:
 * - Header scroll & mobile navigation
 * - Global Cart Drawer (slide-over, quantity adjustments, promo codes)
 * - Global Auth Modal (Login, Registration, Demo Login, Guest Gatekeeper)
 * - Global Product Customization Modal (Cup Size, Milk, Sweetness, Shots)
 * - Toast Notification System
 * - Shared UI event dispatchers
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'success') {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-check-circle text-caramel';
    if (type === 'error') iconClass = 'fa-exclamation-circle text-danger';
    if (type === 'info') iconClass = 'fa-info-circle text-gold';

    toast.innerHTML = `
      <i class="fas ${iconClass}"></i>
      <span style="font-size:0.9rem; font-weight:600;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
  window.showToast = showToast;

  // --------------------------------------------------------------------------
  // SHARED HEADER & CART DRAWER INJECTION
  // --------------------------------------------------------------------------
  function updateNavUserStatus() {
    const user = window.DB.getCurrentUser();
    const userBtn = document.getElementById('nav-user-btn');
    
    if (userBtn) {
      if (user) {
        userBtn.innerHTML = `<i class="fas fa-user-check text-caramel"></i>`;
        userBtn.title = `Signed in as ${user.full_name} (${user.loyalty_points || 0} Beans)`;
      } else {
        userBtn.innerHTML = `<i class="fas fa-user"></i>`;
        userBtn.title = `Sign In / Register`;
      }
    }
  }

  function updateCartBadge() {
    const cart = window.DB.getCart();
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = cart.totalItemsCount;
      badge.style.display = cart.totalItemsCount > 0 ? 'flex' : 'none';
    }
  }

  // Render items inside the slide-over cart drawer
  function renderCartDrawer() {
    const cartContainer = document.getElementById('cart-drawer-items');
    if (!cartContainer) return;

    const cart = window.DB.getCart();

    if (cart.items.length === 0) {
      cartContainer.innerHTML = `
        <div style="text-align:center; padding:3.5rem 1rem;">
          <div style="width:70px; height:70px; margin:0 auto 1.2rem; border-radius:50%; background:rgba(212,155,106,0.1); display:flex; align-items:center; justify-content:center; color:var(--caramel);">
            <i class="fas fa-mug-hot" style="font-size:1.8rem;"></i>
          </div>
          <h4 style="font-size:1.2rem; margin-bottom:0.5rem;">Your cup is empty</h4>
          <p style="font-size:0.88rem; color:var(--cream-muted); margin-bottom:1.5rem;">Discover Coffee Corner's artisanal roasts and fresh pastry pairings.</p>
          <a href="menu.html" class="btn btn-primary btn-sm" onclick="closeCartDrawer()">Explore Menu</a>
        </div>
      `;
    } else {
      cartContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item-card">
          <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-meta">${item.cup_size} • ${item.milk_choice}${item.extra_shot ? ' • +Shot' : ''}</div>
            <div class="cart-item-price">$${item.subtotal.toFixed(2)} <span style="font-size:0.75rem; color:var(--cream-muted);">($${item.unit_price.toFixed(2)} ea)</span></div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="handleCartQtyChange(${item.cart_item_id}, -1)">-</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="handleCartQtyChange(${item.cart_item_id}, 1)">+</button>
          </div>
          <button style="background:none; border:none; color:var(--cream-muted); cursor:pointer; padding:0.3rem;" onclick="handleRemoveCartItem(${item.cart_item_id})" title="Remove">
            <i class="fas fa-trash-alt" style="font-size:0.85rem;"></i>
          </button>
        </div>
      `).join('');
    }

    // Update Totals
    const subtotalEl = document.getElementById('cart-drawer-subtotal');
    const discountEl = document.getElementById('cart-drawer-discount');
    const discountRow = document.getElementById('cart-drawer-discount-row');
    const taxEl = document.getElementById('cart-drawer-tax');
    const deliveryEl = document.getElementById('cart-drawer-delivery');
    const totalEl = document.getElementById('cart-drawer-total');

    if (subtotalEl) subtotalEl.textContent = `$${cart.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${cart.tax.toFixed(2)}`;
    if (deliveryEl) deliveryEl.textContent = cart.deliveryFee === 0 ? 'FREE' : `$${cart.deliveryFee.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${cart.total.toFixed(2)}`;

    if (discountRow) {
      if (cart.discount > 0) {
        discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-$${cart.discount.toFixed(2)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
  }

  window.handleCartQtyChange = function (id, delta) {
    window.DB.updateCartItemQty(id, delta);
  };

  window.handleRemoveCartItem = function (id) {
    window.DB.removeCartItem(id);
    showToast('Item removed from cart', 'info');
  };

  window.openCartDrawer = function () {
    const drawer = document.getElementById('cart-drawer-overlay');
    if (drawer) {
      drawer.classList.add('active');
      renderCartDrawer();
    }
  };

  window.closeCartDrawer = function () {
    const drawer = document.getElementById('cart-drawer-overlay');
    if (drawer) drawer.classList.remove('active');
  };

  // --------------------------------------------------------------------------
  // PRODUCT CUSTOMIZATION MODAL (Drink Customizer)
  // --------------------------------------------------------------------------
  let currentCustomizingItem = null;

  window.openCustomizeModal = function (itemId) {
    const item = window.DB.getMenuItemById(itemId);
    if (!item) return;

    currentCustomizingItem = item;
    const modal = document.getElementById('customizer-modal');
    if (!modal) return;

    document.getElementById('customizer-title').textContent = item.name;
    document.getElementById('customizer-desc').textContent = item.description;
    document.getElementById('customizer-img').src = item.image_url;
    document.getElementById('customizer-base-price').textContent = `$${item.price.toFixed(2)}`;
    
    // Reset selections
    const sizeRadios = document.querySelectorAll('input[name="cup-size"]');
    if (sizeRadios.length) sizeRadios[0].checked = true;

    const milkRadios = document.querySelectorAll('input[name="milk-choice"]');
    if (milkRadios.length) milkRadios[0].checked = true;

    const sweetRadios = document.querySelectorAll('input[name="sweetness"]');
    if (sweetRadios.length) sweetRadios[2].checked = true; // 50% default

    const extraShotChk = document.getElementById('custom-extra-shot');
    if (extraShotChk) extraShotChk.checked = false;

    updateCustomizerPricePreview();
    modal.classList.add('active');
  };

  window.closeCustomizeModal = function () {
    const modal = document.getElementById('customizer-modal');
    if (modal) modal.classList.remove('active');
    currentCustomizingItem = null;
  };

  function updateCustomizerPricePreview() {
    if (!currentCustomizingItem) return;
    let price = currentCustomizingItem.price;

    const sizeEl = document.querySelector('input[name="cup-size"]:checked');
    if (sizeEl) {
      if (sizeEl.value.includes('Large')) price += 0.50;
      if (sizeEl.value.includes('Grande')) price += 0.90;
    }

    const shotEl = document.getElementById('custom-extra-shot');
    if (shotEl && shotEl.checked) price += 0.85;

    const previewEl = document.getElementById('customizer-calculated-price');
    if (previewEl) previewEl.textContent = `$${price.toFixed(2)}`;
  }

  window.handleCustomizerFormChange = function () {
    updateCustomizerPricePreview();
  };

  window.submitCustomizedItemToCart = function () {
    if (!currentCustomizingItem) return;

    const sizeEl = document.querySelector('input[name="cup-size"]:checked');
    const milkEl = document.querySelector('input[name="milk-choice"]:checked');
    const sweetEl = document.querySelector('input[name="sweetness"]:checked');
    const shotEl = document.getElementById('custom-extra-shot');

    const customizations = {
      cup_size: sizeEl ? sizeEl.value : 'Regular (12oz)',
      milk_choice: milkEl ? milkEl.value : 'Whole Milk',
      sweetness: sweetEl ? sweetEl.value : '50% Half Sweet',
      extra_shot: shotEl ? shotEl.checked : false
    };

    window.DB.addToCart(currentCustomizingItem, customizations, 1);
    closeCustomizeModal();
    showToast(`Added ${currentCustomizingItem.name} to cart!`);
    openCartDrawer();
  };

  // Quick direct add to cart
  window.quickAddToCart = function (itemId) {
    const item = window.DB.getMenuItemById(itemId);
    if (!item) return;

    window.DB.addToCart(item, {
      cup_size: 'Regular (12oz)',
      milk_choice: 'Whole Milk',
      sweetness: '50% Half Sweet',
      extra_shot: false
    }, 1);

    showToast(`Added ${item.name} to cart!`);
    updateCartBadge();
  };

  // --------------------------------------------------------------------------
  // AUTH MODAL & DEMO CREDENTIALS
  // --------------------------------------------------------------------------
  window.openAuthModal = function (initialTab = 'login', guestNotice = false) {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const noticeEl = document.getElementById('auth-guest-notice');
    if (noticeEl) {
      noticeEl.style.display = guestNotice ? 'block' : 'none';
    }

    switchAuthTab(initialTab);
    modal.classList.add('active');
  };

  window.closeAuthModal = function () {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  };

  window.switchAuthTab = function (tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
    }
  };

  window.fillDemoCustomerLogin = function () {
    const emailField = document.getElementById('login-email');
    const passField = document.getElementById('login-password');
    if (emailField) emailField.value = 'sarah@coffeecorner.com';
    if (passField) passField.value = 'password123';
  };

  window.handleCustomerLogin = function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const res = window.DB.login(email, pass);
    if (res.success) {
      showToast(`Welcome to Coffee Corner, ${res.user.full_name}!`);
      closeAuthModal();
      updateNavUserStatus();
      if (window.location.pathname.includes('checkout')) {
        window.location.reload();
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  window.handleCustomerRegister = function (e) {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;

    const res = window.DB.register({ fullName, email, password, phone, address });
    if (res.success) {
      showToast(`Account created! Welcome to Coffee Corner, ${fullName}!`);
      closeAuthModal();
      updateNavUserStatus();
    } else {
      showToast(res.message, 'error');
    }
  };

  window.handleCustomerLogout = function () {
    window.DB.logout();
    showToast('Signed out of Coffee Corner.', 'info');
    updateNavUserStatus();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  };

  // Nav user button handler
  window.handleNavUserClick = function () {
    const user = window.DB.getCurrentUser();
    if (user) {
      window.location.href = 'dashboard.html';
    } else {
      openAuthModal('login');
    }
  };

  // --------------------------------------------------------------------------
  // PROMO COUPON CODE HANDLER
  // --------------------------------------------------------------------------
  window.handleApplyCoupon = function (inputId = 'cart-coupon-input') {
    const input = document.getElementById(inputId);
    if (!input) return;
    const code = input.value.trim();
    if (!code) {
      showToast('Please enter a coupon code (e.g. CORNER10).', 'info');
      return;
    }
    const res = window.DB.applyCoupon(code);
    if (res.success) {
      showToast(res.message, 'success');
      renderCartDrawer();
    } else {
      showToast(res.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // CHECKOUT PROCEED GATEKEEPER
  // Rule: Guests can freely browse; require login when placing order
  // --------------------------------------------------------------------------
  window.proceedToCheckout = function () {
    const cart = window.DB.getCart();
    if (cart.items.length === 0) {
      showToast('Your cart is empty. Please select a beverage or snack!', 'info');
      return;
    }

    const user = window.DB.getCurrentUser();
    if (!user) {
      openAuthModal('login', true);
    } else {
      window.location.href = 'checkout.html';
    }
  };

  // --------------------------------------------------------------------------
  // SETUP DOM ON READY
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Glass Header with shadow transition
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });
    }

    // 3. Listen to DB Events
    window.addEventListener('cartUpdated', () => {
      updateCartBadge();
      renderCartDrawer();
    });

    window.addEventListener('authChanged', () => {
      updateNavUserStatus();
    });

    // Initial Sync
    updateCartBadge();
    updateNavUserStatus();
  });

})(window, document);
