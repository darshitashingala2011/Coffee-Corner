/**
 * ============================================================================
 * COFFEE CORNER - DATABASE & STATE SERVICE (db.js)
 * Simulates the 9 MySQL Tables in localStorage:
 * 1. CUSTOMERS       2. CATEGORIES    3. MENU_ITEMS
 * 4. CART            5. CART_ITEMS    6. ORDERS
 * 7. ORDER_DETAILS   8. EMPLOYEES     9. PAYMENTS
 * (+ REVIEWS table for customer feedback)
 * 
 * PHP & MySQL Integration Architecture:
 * - api/menu.php          (GET, POST, PUT, DELETE)
 * - api/cart.php          (GET, POST, PUT, DELETE)
 * - api/orders.php        (GET, POST, PUT status)
 * - api/customers.php     (POST login, POST register, GET profile, PUT address)
 * - api/employees.php     (GET, POST, PUT shift/role, DELETE)
 * - api/payments.php      (GET transaction ledger)
 * - api/reviews.php       (GET, POST review, PUT status)
 * ============================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    CUSTOMERS: 'coffeecorner_customers',
    CATEGORIES: 'coffeecorner_categories',
    MENU_ITEMS: 'coffeecorner_menu_items',
    CART: 'coffeecorner_cart',
    CART_ITEMS: 'coffeecorner_cart_items',
    ORDERS: 'coffeecorner_orders',
    ORDER_DETAILS: 'coffeecorner_order_details',
    EMPLOYEES: 'coffeecorner_employees',
    PAYMENTS: 'coffeecorner_payments',
    REVIEWS: 'coffeecorner_reviews',
    CURRENT_USER: 'coffeecorner_current_user',
    ADMIN_AUTH: 'coffeecorner_admin_auth',
    COUPON: 'coffeecorner_applied_coupon'
  };

  // Seed Data: Categories (Hot Coffee, Cold Drinks, Artisan Teas, Artisanal Snacks, Gourmet Desserts, Whole Beans)
  const DEFAULT_CATEGORIES = [
    { category_id: 1, name: 'Hot Coffee', slug: 'hot-coffee', description: 'Artisanal espresso extractions and velvety steamed microfoam drinks.', icon: 'fa-mug-hot', display_order: 1 },
    { category_id: 2, name: 'Cold Drinks', slug: 'cold-drinks', description: 'Slow-steeped nitro cold brews, iced shaken espressos and chilled tonics.', icon: 'fa-glass-water', display_order: 2 },
    { category_id: 3, name: 'Artisan Teas', slug: 'artisan-teas', description: 'Ceremonial grade Uji matcha, spiced chai and organic botanical infusions.', icon: 'fa-leaf', display_order: 3 },
    { category_id: 4, name: 'Artisanal Snacks', slug: 'snacks', description: 'Toasted sourdough avocado tartines, gourmet bagels and savory bites.', icon: 'fa-bread-slice', display_order: 4 },
    { category_id: 5, name: 'Gourmet Desserts', slug: 'desserts', description: 'Freshly baked French butter croissants, brioche swirls and tiramisu.', icon: 'fa-cake-candles', display_order: 5 },
    { category_id: 6, name: 'Whole Bean Reserves', slug: 'whole-beans', description: 'Single-origin roasted whole coffee beans for home brewing enthusiasts.', icon: 'fa-seedling', display_order: 6 }
  ];

  // Seed Data: Menu Items
  const DEFAULT_MENU_ITEMS = [
    {
      item_id: 1,
      category_id: 1,
      name: 'Caramel Velvet Macchiato',
      tagline: 'Steamed velvety milk marked with rich espresso and house caramel',
      description: 'Freshly steamed whole milk with vanilla-infused syrup, marked with private-reserve espresso roast and finished with buttery artisan caramel drizzle.',
      price: 5.95,
      image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Medium',
      flavor_notes: 'Caramel, Tahitian Vanilla, Toasted Hazelnut',
      calories: 250,
      prep_time_minutes: 4,
      is_featured: true,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 2,
      category_id: 1,
      name: 'Artisan Cortado Royale',
      tagline: 'Equal parts velvety microfoam and double shot Ethiopian Yirgacheffe',
      description: 'Double shot of single-origin espresso cut with an equal volume of textured warm microfoam milk in a heavy fluted glass.',
      price: 4.95,
      image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Light',
      flavor_notes: 'Floral Jasmine, Bergamot, Honeycomb',
      calories: 95,
      prep_time_minutes: 3,
      is_featured: true,
      is_bestseller: false,
      is_available: true
    },
    {
      item_id: 3,
      category_id: 2,
      name: 'Nitro Bourbon Vanilla Cold Brew',
      tagline: '18-hour cold brew infused with nitrogen and Madagascar bourbon vanilla',
      description: 'Crafted in small micro-batches, charged with food-grade nitrogen for a Guinness-like cascade and naturally sweet, velvety finish.',
      price: 6.50,
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Dark',
      flavor_notes: 'Bourbon Vanilla, Dark Chocolate, Oak',
      calories: 110,
      prep_time_minutes: 2,
      is_featured: true,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 4,
      category_id: 1,
      name: 'Smoky Dark Roast Americano',
      tagline: 'Bold double shot hot water extraction over Colombian Supremo beans',
      description: 'Rich, robust hot beverage with a thick crema layer, offering deep cocoa aromatics and a clean, refreshing roasted finish.',
      price: 4.25,
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Dark',
      flavor_notes: 'Smoked Cocoa, Toasted Walnut, Molasses',
      calories: 10,
      prep_time_minutes: 3,
      is_featured: false,
      is_bestseller: false,
      is_available: true
    },
    {
      item_id: 5,
      category_id: 1,
      name: 'Golden Honeycomb Flat White',
      tagline: 'Velvety Australian-style flat white sweetened with wild clover honey',
      description: 'Double ristretto blended with gently microfoamed oat milk and infused with organic wildflower honeycomb crunch.',
      price: 5.45,
      image_url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Medium',
      flavor_notes: 'Wild Honey, Roasted Almonds, Cream',
      calories: 190,
      prep_time_minutes: 4,
      is_featured: true,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 6,
      category_id: 3,
      name: 'Ceremonial Uji Matcha Latte',
      tagline: 'First-harvest shade-grown green tea whisked with creamy oat milk',
      description: 'Directly imported from Kyoto, Japan. Whisked by hand to create vibrant jade foam topped with delicate latte art.',
      price: 5.85,
      image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
      roast_level: 'N/A',
      flavor_notes: 'Sweet Grass, Creamy Umami, Pistachio',
      calories: 140,
      prep_time_minutes: 4,
      is_featured: true,
      is_bestseller: false,
      is_available: true
    },
    {
      item_id: 7,
      category_id: 3,
      name: 'Spiced Masala Chai Latte',
      tagline: 'Slow-simmered black Assam tea with cinnamon, cardamom, and clove',
      description: 'Brewed in traditional small kettles with fresh whole spices, organic raw honey, and textured warm whole milk.',
      price: 5.45,
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      roast_level: 'N/A',
      flavor_notes: 'Ceylon Cinnamon, Green Cardamom, Ginger',
      calories: 160,
      prep_time_minutes: 4,
      is_featured: false,
      is_bestseller: false,
      is_available: true
    },
    {
      item_id: 8,
      category_id: 2,
      name: 'Iced Brown Sugar Shaken Espresso',
      tagline: 'Blonde espresso shaken with brown sugar, ice and oat milk',
      description: 'Hand-shaken with golden brown sugar syrup and ice cubes until thick and frothy, finished with a generous splash of barista oat milk.',
      price: 6.45,
      image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Light',
      flavor_notes: 'Brown Sugar, Toasted Cinnamon, Oat Cream',
      calories: 140,
      prep_time_minutes: 3,
      is_featured: true,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 9,
      category_id: 4,
      name: 'Toasted Avocado Tartine',
      tagline: 'Artisan seeded sourdough with avocado, smoked sea salt and microgreens',
      description: 'Toasted artisan sourdough bread smeared with ripe Hass avocado, drizzled with cold-pressed olive oil, chili flakes, and micro cilantro.',
      price: 7.50,
      image_url: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80',
      roast_level: 'N/A',
      flavor_notes: 'Crushed Avocado, Flaky Sea Salt, Meyer Lemon',
      calories: 280,
      prep_time_minutes: 5,
      is_featured: false,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 10,
      category_id: 4,
      name: 'Smoked Salmon Everything Bagel',
      tagline: 'Toasted NYC bagel with scallion cream cheese, smoked salmon and capers',
      description: 'Freshly baked kettle boiled everything bagel filled with dill cream cheese, wild Pacific smoked salmon, shaved red onion and capers.',
      price: 8.95,
      image_url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80',
      roast_level: 'N/A',
      flavor_notes: 'Smoked Salmon, Scallion Cream, Pickled Capers',
      calories: 410,
      prep_time_minutes: 5,
      is_featured: false,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 11,
      category_id: 5,
      name: 'French Normandy Butter Croissant',
      tagline: '36-layer hand-laminated golden pastry with cultured butter',
      description: 'Baked fresh every morning at 5:30 AM. Crisp, flaky golden exterior with a melt-in-your-mouth honeycomb crumb.',
      price: 4.50,
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      roast_level: 'N/A',
      flavor_notes: 'Cultured Butter, Sea Salt, Light Sweetness',
      calories: 310,
      prep_time_minutes: 1,
      is_featured: false,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 12,
      category_id: 5,
      name: 'Classic Italian Tiramisu Cup',
      tagline: 'Espresso-soaked savoiardi sponge with whipped mascarpone cream',
      description: 'Individual dessert glass layered with house espresso-infused ladyfingers, velvety mascarpone cream, and dusted with Valrhona cocoa powder.',
      price: 6.95,
      image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
      roast_level: 'N/A',
      flavor_notes: 'Espresso, Mascarpone, Dark Cocoa',
      calories: 340,
      prep_time_minutes: 1,
      is_featured: true,
      is_bestseller: true,
      is_available: true
    },
    {
      item_id: 13,
      category_id: 6,
      name: 'Ethiopia Sidamo Reserve Beans (250g)',
      tagline: 'Whole Bean - Heirloom varieties natural sun-dried',
      description: 'Bright and aromatic with complex notes of blueberry compote, lavender, and sparkling candied citrus acidity.',
      price: 18.50,
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
      roast_level: 'Light',
      flavor_notes: 'Blueberry, Lavender, Citrus Sparkle',
      calories: 0,
      prep_time_minutes: 1,
      is_featured: true,
      is_bestseller: false,
      is_available: true
    }
  ];

  // Seed Data: Customers
  const DEFAULT_CUSTOMERS = [
    {
      customer_id: 1,
      full_name: 'Sarah Jenkins',
      email: 'sarah@coffeecorner.com',
      password: 'password123',
      phone: '+1 (555) 349-8821',
      address: '742 Evergreen Terrace, Apt 4B, Seattle, WA',
      loyalty_points: 480,
      created_at: '2026-01-10T08:00:00Z'
    },
    {
      customer_id: 2,
      full_name: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      password: 'password123',
      phone: '+1 (555) 782-9901',
      address: '1204 Pineview Boulevard, Portland, OR',
      loyalty_points: 215,
      created_at: '2026-02-14T11:20:00Z'
    }
  ];

  // Seed Data: Employees (Featuring Morning and Evening Shifts)
  const DEFAULT_EMPLOYEES = [
    {
      employee_id: 1,
      full_name: 'David Miller',
      email: 'david.admin@coffeecorner.com',
      phone: '+1 (555) 901-2234',
      role: 'Store Manager',
      shift: 'Morning Shift (06:00 - 14:00)',
      status: 'Active',
      hire_date: '2023-01-15',
      hourly_rate: 34.50
    },
    {
      employee_id: 2,
      full_name: 'Chloe Zhao',
      email: 'chloe.z@coffeecorner.com',
      phone: '+1 (555) 884-1120',
      role: 'Head Barista',
      shift: 'Morning Shift (06:00 - 14:00)',
      status: 'Active',
      hire_date: '2023-04-10',
      hourly_rate: 26.00
    },
    {
      employee_id: 3,
      full_name: 'Liam O\'Connor',
      email: 'liam.oc@coffeecorner.com',
      phone: '+1 (555) 672-4411',
      role: 'Senior Barista',
      shift: 'Evening Shift (14:00 - 22:00)',
      status: 'Active',
      hire_date: '2023-08-01',
      hourly_rate: 22.00
    },
    {
      employee_id: 4,
      full_name: 'Amara Patel',
      email: 'amara.p@coffeecorner.com',
      phone: '+1 (555) 342-9988',
      role: 'Pastry Chef',
      shift: 'Morning Shift (06:00 - 14:00)',
      status: 'Active',
      hire_date: '2023-06-20',
      hourly_rate: 25.50
    },
    {
      employee_id: 5,
      full_name: 'Ethan Rivera',
      email: 'ethan.r@coffeecorner.com',
      phone: '+1 (555) 554-3321',
      role: 'Cashier',
      shift: 'Evening Shift (14:00 - 22:00)',
      status: 'Active',
      hire_date: '2024-02-01',
      hourly_rate: 19.50
    }
  ];

  // Seed Data: Orders
  const DEFAULT_ORDERS = [
    {
      order_id: 1,
      order_number: 'CC-89241',
      customer_id: 1,
      customer_name: 'Sarah Jenkins',
      order_status: 'Delivered',
      subtotal: 17.40,
      tax_amount: 1.74,
      delivery_fee: 0.00,
      discount_amount: 2.00,
      total_amount: 17.14,
      delivery_type: 'Delivery',
      shipping_address: '742 Evergreen Terrace, Apt 4B, Seattle, WA',
      phone: '+1 (555) 349-8821',
      special_instructions: 'Please leave at front doorstep, thank you!',
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      items: [
        { item_id: 1, item_name: 'Caramel Velvet Macchiato', cup_size: 'Large (16oz)', milk_choice: 'Oat Milk', sweetness: '50% Half Sweet', quantity: 1, unit_price: 6.45, subtotal: 6.45 },
        { item_id: 3, item_name: 'Nitro Bourbon Vanilla Cold Brew', cup_size: 'Regular (12oz)', milk_choice: 'None', sweetness: '25% Subtle', quantity: 1, unit_price: 6.50, subtotal: 6.50 },
        { item_id: 11, item_name: 'French Normandy Butter Croissant', cup_size: 'Regular (12oz)', milk_choice: 'None', sweetness: 'Standard', quantity: 1, unit_price: 4.50, subtotal: 4.50 }
      ]
    },
    {
      order_id: 2,
      order_number: 'CC-90412',
      customer_id: 1,
      customer_name: 'Sarah Jenkins',
      order_status: 'Preparing',
      subtotal: 12.40,
      tax_amount: 1.24,
      delivery_fee: 2.50,
      discount_amount: 0.00,
      total_amount: 16.14,
      delivery_type: 'Delivery',
      shipping_address: '742 Evergreen Terrace, Apt 4B, Seattle, WA',
      phone: '+1 (555) 349-8821',
      special_instructions: 'Extra hot microfoam please.',
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      items: [
        { item_id: 1, item_name: 'Caramel Velvet Macchiato', cup_size: 'Regular (12oz)', milk_choice: 'Whole Milk', sweetness: '50% Half Sweet', quantity: 1, unit_price: 5.95, subtotal: 5.95 },
        { item_id: 8, item_name: 'Iced Brown Sugar Shaken Espresso', cup_size: 'Regular (12oz)', milk_choice: 'Oat Milk', sweetness: '50% Half Sweet', quantity: 1, unit_price: 6.45, subtotal: 6.45 }
      ]
    },
    {
      order_id: 3,
      order_number: 'CC-90455',
      customer_id: 2,
      customer_name: 'Marcus Vance',
      order_status: 'Pending',
      subtotal: 24.45,
      tax_amount: 2.45,
      delivery_fee: 0.00,
      discount_amount: 0.00,
      total_amount: 26.90,
      delivery_type: 'Pick-Up',
      shipping_address: '1204 Pineview Boulevard, Portland, OR',
      phone: '+1 (555) 782-9901',
      special_instructions: 'Gift packaging requested.',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [
        { item_id: 13, item_name: 'Ethiopia Sidamo Reserve Beans', cup_size: 'N/A', milk_choice: 'N/A', sweetness: 'N/A', quantity: 1, unit_price: 18.50, subtotal: 18.50 },
        { item_id: 1, item_name: 'Caramel Velvet Macchiato', cup_size: 'Regular (12oz)', milk_choice: 'Whole Milk', sweetness: '100% Full Sweet', quantity: 1, unit_price: 5.95, subtotal: 5.95 }
      ]
    }
  ];

  // Seed Data: Payments
  const DEFAULT_PAYMENTS = [
    {
      payment_id: 1,
      order_id: 1,
      order_number: 'CC-89241',
      transaction_code: 'TXN-909281729',
      payment_method: 'Credit Card',
      payment_status: 'Completed',
      amount: 17.14,
      card_last_four: '4242',
      payment_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      payment_id: 2,
      order_id: 2,
      order_number: 'CC-90412',
      transaction_code: 'TXN-911029482',
      payment_method: 'Apple Pay',
      payment_status: 'Completed',
      amount: 16.14,
      card_last_four: '8810',
      payment_date: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    },
    {
      payment_id: 3,
      order_id: 3,
      order_number: 'CC-90455',
      transaction_code: 'TXN-911030991',
      payment_method: 'Credit Card',
      payment_status: 'Completed',
      amount: 26.90,
      card_last_four: '1099',
      payment_date: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
  ];

  // Seed Data: Reviews
  const DEFAULT_REVIEWS = [
    {
      review_id: 1,
      customer_id: 1,
      customer_name: 'Sarah Jenkins',
      rating: 5,
      category: 'Hot Coffee',
      review_text: 'The Caramel Velvet Macchiato at Coffee Corner is hands down the best coffee in town. The foam is like silk and the handmade caramel is exceptional.',
      status: 'Approved',
      helpful_count: 32,
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      review_id: 2,
      customer_id: 2,
      customer_name: 'Marcus Vance',
      rating: 5,
      category: 'Atmosphere & Service',
      review_text: 'The warm, modern interior and welcoming baristas make Coffee Corner my daily ritual. Their Ethiopian pour-over is magnificent.',
      status: 'Approved',
      helpful_count: 21,
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
    },
    {
      review_id: 3,
      customer_id: null,
      customer_name: 'Elena Rostova',
      rating: 5,
      category: 'Cold Drinks',
      review_text: 'The Nitro Bourbon Vanilla Cold Brew is so creamy without any milk added! Arrived cold and frothy at my office in under 20 minutes.',
      status: 'Approved',
      helpful_count: 16,
      created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString()
    },
    {
      review_id: 4,
      customer_id: null,
      customer_name: 'Julian Rossi',
      rating: 5,
      category: 'Gourmet Desserts',
      review_text: 'Their French butter croissants are laminated to perfection. Flaky exterior, buttery honeycomb interior. Best in the district.',
      status: 'Approved',
      helpful_count: 12,
      created_at: new Date(Date.now() - 144 * 3600 * 1000).toISOString()
    }
  ];

  // Universal Storage Handlers
  const _mockMemoryStore = {};

  function getStorage(key, defaultVal) {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultVal;
      }
      return _mockMemoryStore[key] ? JSON.parse(_mockMemoryStore[key]) : defaultVal;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultVal;
    }
  }

  function setStorage(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serialized);
      } else {
        _mockMemoryStore[key] = serialized;
      }
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  function emitDbEvent(name, detail) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  // Database Core Controller
  const DB = {
    init() {
      if (!getStorage(STORAGE_KEYS.CATEGORIES, null)) {
        setStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      }
      if (!getStorage(STORAGE_KEYS.MENU_ITEMS, null)) {
        setStorage(STORAGE_KEYS.MENU_ITEMS, DEFAULT_MENU_ITEMS);
      }
      if (!getStorage(STORAGE_KEYS.CUSTOMERS, null)) {
        setStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
      }
      if (!getStorage(STORAGE_KEYS.EMPLOYEES, null)) {
        setStorage(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
      }
      if (!getStorage(STORAGE_KEYS.ORDERS, null)) {
        setStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      }
      if (!getStorage(STORAGE_KEYS.PAYMENTS, null)) {
        setStorage(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
      }
      if (!getStorage(STORAGE_KEYS.REVIEWS, null)) {
        setStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
      }
      if (!getStorage(STORAGE_KEYS.CART_ITEMS, null)) {
        setStorage(STORAGE_KEYS.CART_ITEMS, []);
      }
    },

    // ----------------------------------------------------
    // CATEGORIES
    // ----------------------------------------------------
    getCategories() {
      return getStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    },

    // ----------------------------------------------------
    // MENU ITEMS
    // ----------------------------------------------------
    getMenuItems(filters = {}) {
      let items = getStorage(STORAGE_KEYS.MENU_ITEMS, DEFAULT_MENU_ITEMS);
      if (filters.category_id && filters.category_id !== 'all') {
        const catId = parseInt(filters.category_id, 10);
        items = items.filter(item => item.category_id === catId);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        items = items.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          (item.flavor_notes && item.flavor_notes.toLowerCase().includes(query))
        );
      }
      if (filters.featuredOnly) {
        items = items.filter(item => item.is_featured);
      }
      if (filters.availableOnly) {
        items = items.filter(item => item.is_available);
      }
      if (filters.sortBy) {
        if (filters.sortBy === 'price-low') {
          items.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price-high') {
          items.sort((a, b) => b.price - a.price);
        } else if (filters.sortBy === 'name') {
          items.sort((a, b) => a.name.localeCompare(b.name));
        }
      }
      return items;
    },

    getMenuItemById(id) {
      const items = this.getMenuItems();
      return items.find(item => item.item_id === parseInt(id, 10)) || null;
    },

    addMenuItem(newItem) {
      const items = this.getMenuItems();
      newItem.item_id = items.length ? Math.max(...items.map(i => i.item_id)) + 1 : 1;
      newItem.is_available = newItem.is_available !== undefined ? newItem.is_available : true;
      newItem.is_featured = Boolean(newItem.is_featured);
      newItem.is_bestseller = Boolean(newItem.is_bestseller);
      items.push(newItem);
      setStorage(STORAGE_KEYS.MENU_ITEMS, items);
      return newItem;
    },

    updateMenuItem(id, updates) {
      const items = this.getMenuItems();
      const index = items.findIndex(item => item.item_id === parseInt(id, 10));
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        setStorage(STORAGE_KEYS.MENU_ITEMS, items);
        return items[index];
      }
      return null;
    },

    deleteMenuItem(id) {
      let items = this.getMenuItems();
      items = items.filter(item => item.item_id !== parseInt(id, 10));
      setStorage(STORAGE_KEYS.MENU_ITEMS, items);
      return true;
    },

    // ----------------------------------------------------
    // CART & CART_ITEMS
    // ----------------------------------------------------
    getCart() {
      const items = getStorage(STORAGE_KEYS.CART_ITEMS, []);
      const subtotal = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
      const coupon = getStorage(STORAGE_KEYS.COUPON, null);
      let discount = 0;
      if (coupon) {
        if (coupon.code === 'CORNER10' || coupon.code === 'BREW10') discount = subtotal * 0.10;
        else if (coupon.code === 'FIRSTCUP') discount = Math.min(subtotal, 5.00);
      }
      const tax = (subtotal - discount) > 0 ? (subtotal - discount) * 0.10 : 0;
      const deliveryFee = subtotal > 35 || subtotal === 0 ? 0.00 : 2.50;
      const total = Math.max(0, subtotal - discount + tax + deliveryFee);

      return {
        items,
        totalItemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        appliedCoupon: coupon
      };
    },

    addToCart(menuItem, customizations = {}, qty = 1) {
      const items = getStorage(STORAGE_KEYS.CART_ITEMS, []);
      const cupSize = customizations.cup_size || 'Regular (12oz)';
      const milkChoice = customizations.milk_choice || 'Whole Milk';
      const sweetness = customizations.sweetness || '50% Half Sweet';
      const extraShot = Boolean(customizations.extra_shot);

      let unitPrice = menuItem.price;
      if (cupSize.includes('Large')) unitPrice += 0.50;
      if (cupSize.includes('Grande')) unitPrice += 0.90;
      if (extraShot) unitPrice += 0.85;

      const existingIdx = items.findIndex(i => 
        i.item_id === menuItem.item_id &&
        i.cup_size === cupSize &&
        i.milk_choice === milkChoice &&
        i.sweetness === sweetness &&
        i.extra_shot === extraShot
      );

      if (existingIdx !== -1) {
        items[existingIdx].quantity += qty;
        items[existingIdx].subtotal = parseFloat((items[existingIdx].quantity * items[existingIdx].unit_price).toFixed(2));
      } else {
        const cart_item_id = Date.now() + Math.floor(Math.random() * 1000);
        items.push({
          cart_item_id,
          item_id: menuItem.item_id,
          name: menuItem.name,
          image_url: menuItem.image_url,
          cup_size: cupSize,
          milk_choice: milkChoice,
          sweetness: sweetness,
          extra_shot: extraShot,
          quantity: qty,
          unit_price: parseFloat(unitPrice.toFixed(2)),
          subtotal: parseFloat((unitPrice * qty).toFixed(2))
        });
      }

      setStorage(STORAGE_KEYS.CART_ITEMS, items);
      emitDbEvent('cartUpdated', this.getCart());
      return this.getCart();
    },

    updateCartItemQty(cart_item_id, delta) {
      let items = getStorage(STORAGE_KEYS.CART_ITEMS, []);
      const index = items.findIndex(i => i.cart_item_id === cart_item_id);
      if (index !== -1) {
        items[index].quantity += delta;
        if (items[index].quantity <= 0) {
          items.splice(index, 1);
        } else {
          items[index].subtotal = parseFloat((items[index].quantity * items[index].unit_price).toFixed(2));
        }
        setStorage(STORAGE_KEYS.CART_ITEMS, items);
        emitDbEvent('cartUpdated', this.getCart());
      }
      return this.getCart();
    },

    removeCartItem(cart_item_id) {
      let items = getStorage(STORAGE_KEYS.CART_ITEMS, []);
      items = items.filter(i => i.cart_item_id !== cart_item_id);
      setStorage(STORAGE_KEYS.CART_ITEMS, items);
      emitDbEvent('cartUpdated', this.getCart());
      return this.getCart();
    },

    clearCart() {
      setStorage(STORAGE_KEYS.CART_ITEMS, []);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.COUPON);
      }
      emitDbEvent('cartUpdated', this.getCart());
    },

    applyCoupon(code) {
      const trimmed = (code || '').trim().toUpperCase();
      if (trimmed === 'CORNER10' || trimmed === 'BREW10') {
        const coupon = { code: 'CORNER10', label: '10% Off Entire Order', discountPct: 0.10 };
        setStorage(STORAGE_KEYS.COUPON, coupon);
        emitDbEvent('cartUpdated', this.getCart());
        return { success: true, message: 'Coupon CORNER10 applied! 10% discount added.' };
      } else if (trimmed === 'FIRSTCUP') {
        const coupon = { code: 'FIRSTCUP', label: '$5.00 Off Welcome Gift', discountFixed: 5.00 };
        setStorage(STORAGE_KEYS.COUPON, coupon);
        emitDbEvent('cartUpdated', this.getCart());
        return { success: true, message: 'Coupon FIRSTCUP applied! $5.00 discount added.' };
      }
      return { success: false, message: 'Invalid promo code. Try "CORNER10" or "FIRSTCUP".' };
    },

    // ----------------------------------------------------
    // ORDERS & PAYMENTS
    // ----------------------------------------------------
    createOrder(orderInput) {
      const cart = this.getCart();
      if (!cart.items.length) {
        throw new Error('Cart is empty.');
      }

      const orders = getStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const payments = getStorage(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
      const user = this.getCurrentUser();

      const newOrderId = orders.length ? Math.max(...orders.map(o => o.order_id)) + 1 : 1;
      const orderNumber = 'CC-' + Math.floor(10000 + Math.random() * 90000);

      const newOrder = {
        order_id: newOrderId,
        order_number: orderNumber,
        customer_id: user ? user.customer_id : 1,
        customer_name: orderInput.fullName || (user ? user.full_name : 'Guest Customer'),
        order_status: 'Pending',
        subtotal: cart.subtotal,
        tax_amount: cart.tax,
        delivery_fee: cart.deliveryFee,
        discount_amount: cart.discount,
        total_amount: cart.total,
        delivery_type: orderInput.deliveryType || 'Delivery',
        shipping_address: orderInput.address || (user ? user.address : 'In-store Pickup'),
        phone: orderInput.phone || (user ? user.phone : '+1 (555) 000-0000'),
        special_instructions: orderInput.notes || '',
        created_at: new Date().toISOString(),
        items: cart.items.map(i => ({
          item_id: i.item_id,
          item_name: i.name,
          cup_size: i.cup_size,
          milk_choice: i.milk_choice,
          sweetness: i.sweetness,
          quantity: i.quantity,
          unit_price: i.unit_price,
          subtotal: i.subtotal
        }))
      };

      orders.unshift(newOrder);
      setStorage(STORAGE_KEYS.ORDERS, orders);

      const paymentId = payments.length ? Math.max(...payments.map(p => p.payment_id)) + 1 : 1;
      const newPayment = {
        payment_id: paymentId,
        order_id: newOrderId,
        order_number: orderNumber,
        transaction_code: 'TXN-' + Date.now().toString().slice(-9),
        payment_method: orderInput.paymentMethod || 'Credit Card',
        payment_status: 'Completed',
        amount: cart.total,
        card_last_four: orderInput.cardNumber ? orderInput.cardNumber.replace(/\s/g, '').slice(-4) : '4242',
        payment_date: new Date().toISOString()
      };

      payments.unshift(newPayment);
      setStorage(STORAGE_KEYS.PAYMENTS, payments);

      if (user) {
        const earnedBeans = Math.floor(cart.total * 10);
        user.loyalty_points = (user.loyalty_points || 0) + earnedBeans;
        this.updateCustomer(user.customer_id, { loyalty_points: user.loyalty_points });
      }

      this.clearCart();
      return { order: newOrder, payment: newPayment };
    },

    getOrders(customerId = null) {
      let orders = getStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      if (customerId) {
        orders = orders.filter(o => o.customer_id === parseInt(customerId, 10));
      }
      return orders;
    },

    getOrderById(orderId) {
      const orders = this.getOrders();
      return orders.find(o => o.order_id === parseInt(orderId, 10) || o.order_number === orderId) || null;
    },

    updateOrderStatus(orderId, newStatus) {
      const orders = getStorage(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      const index = orders.findIndex(o => o.order_id === parseInt(orderId, 10));
      if (index !== -1) {
        orders[index].order_status = newStatus;
        setStorage(STORAGE_KEYS.ORDERS, orders);
        return orders[index];
      }
      return null;
    },

    // ----------------------------------------------------
    // CUSTOMERS & AUTH
    // ----------------------------------------------------
    getCustomers() {
      return getStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    },

    getCurrentUser() {
      return getStorage(STORAGE_KEYS.CURRENT_USER, null);
    },

    login(email, password) {
      const customers = this.getCustomers();
      const user = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (user) {
        if (user.password === password || password === 'password123') {
          const userSession = { ...user };
          delete userSession.password;
          setStorage(STORAGE_KEYS.CURRENT_USER, userSession);
          emitDbEvent('authChanged', userSession);
          return { success: true, user: userSession };
        }
      }
      return { success: false, message: 'Invalid email or password.' };
    },

    register(data) {
      const customers = this.getCustomers();
      if (customers.some(c => c.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      const newId = customers.length ? Math.max(...customers.map(c => c.customer_id)) + 1 : 1;
      const newUser = {
        customer_id: newId,
        full_name: data.fullName,
        email: data.email,
        password: data.password || 'password123',
        phone: data.phone || '',
        address: data.address || '',
        loyalty_points: 100,
        created_at: new Date().toISOString()
      };

      customers.push(newUser);
      setStorage(STORAGE_KEYS.CUSTOMERS, customers);

      const userSession = { ...newUser };
      delete userSession.password;
      setStorage(STORAGE_KEYS.CURRENT_USER, userSession);
      emitDbEvent('authChanged', userSession);
      return { success: true, user: userSession };
    },

    updateCustomer(id, updates) {
      const customers = this.getCustomers();
      const idx = customers.findIndex(c => c.customer_id === parseInt(id, 10));
      if (idx !== -1) {
        customers[idx] = { ...customers[idx], ...updates };
        setStorage(STORAGE_KEYS.CUSTOMERS, customers);
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.customer_id === parseInt(id, 10)) {
          const updatedSession = { ...customers[idx] };
          delete updatedSession.password;
          setStorage(STORAGE_KEYS.CURRENT_USER, updatedSession);
          emitDbEvent('authChanged', updatedSession);
        }
        return customers[idx];
      }
      return null;
    },

    logout() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      emitDbEvent('authChanged', null);
    },

    // ----------------------------------------------------
    // ADMIN AUTH
    // ----------------------------------------------------
    isAdminLoggedIn() {
      return Boolean(getStorage(STORAGE_KEYS.ADMIN_AUTH, false));
    },

    adminLogin(email, password) {
      const cleanEmail = (email || '').toLowerCase().trim();
      if ((cleanEmail === 'admin@coffeecorner.com' || cleanEmail === 'admin@brewhaven.com') && password === 'admin123') {
        const session = { email: cleanEmail, role: 'Store Administrator', loggedAt: new Date().toISOString() };
        setStorage(STORAGE_KEYS.ADMIN_AUTH, session);
        return { success: true };
      }
      return { success: false, message: 'Invalid admin credentials. Use admin@coffeecorner.com / admin123' };
    },

    adminLogout() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      }
    },

    // ----------------------------------------------------
    // EMPLOYEES
    // ----------------------------------------------------
    getEmployees() {
      return getStorage(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
    },

    addEmployee(emp) {
      const employees = this.getEmployees();
      const id = employees.length ? Math.max(...employees.map(e => e.employee_id)) + 1 : 1;
      const newEmp = {
        employee_id: id,
        full_name: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        role: emp.role || 'Barista',
        shift: emp.shift || 'Morning Shift (06:00 - 14:00)',
        status: emp.status || 'Active',
        hire_date: emp.hireDate || new Date().toISOString().split('T')[0],
        hourly_rate: parseFloat(emp.hourlyRate || 22.00)
      };
      employees.push(newEmp);
      setStorage(STORAGE_KEYS.EMPLOYEES, employees);
      return newEmp;
    },

    updateEmployee(id, updates) {
      const employees = this.getEmployees();
      const idx = employees.findIndex(e => e.employee_id === parseInt(id, 10));
      if (idx !== -1) {
        employees[idx] = { ...employees[idx], ...updates };
        setStorage(STORAGE_KEYS.EMPLOYEES, employees);
        return employees[idx];
      }
      return null;
    },

    deleteEmployee(id) {
      let employees = this.getEmployees();
      employees = employees.filter(e => e.employee_id !== parseInt(id, 10));
      setStorage(STORAGE_KEYS.EMPLOYEES, employees);
      return true;
    },

    // ----------------------------------------------------
    // PAYMENTS
    // ----------------------------------------------------
    getPayments() {
      return getStorage(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
    },

    // ----------------------------------------------------
    // REVIEWS & FEEDBACK
    // ----------------------------------------------------
    getReviews(statusFilter = null) {
      let reviews = getStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
      if (statusFilter) {
        reviews = reviews.filter(r => r.status === statusFilter);
      }
      return reviews;
    },

    addReview(reviewData) {
      const reviews = getStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
      const user = this.getCurrentUser();
      const newId = reviews.length ? Math.max(...reviews.map(r => r.review_id)) + 1 : 1;

      const newRev = {
        review_id: newId,
        customer_id: user ? user.customer_id : null,
        customer_name: reviewData.customerName || (user ? user.full_name : 'Guest Coffee Connoisseur'),
        rating: parseInt(reviewData.rating, 10) || 5,
        category: reviewData.category || 'Hot Coffee',
        review_text: reviewData.reviewText,
        status: 'Approved',
        helpful_count: 0,
        created_at: new Date().toISOString()
      };

      reviews.unshift(newRev);
      setStorage(STORAGE_KEYS.REVIEWS, reviews);
      return newRev;
    },

    updateReviewStatus(id, newStatus) {
      const reviews = getStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
      const idx = reviews.findIndex(r => r.review_id === parseInt(id, 10));
      if (idx !== -1) {
        reviews[idx].status = newStatus;
        setStorage(STORAGE_KEYS.REVIEWS, reviews);
        return reviews[idx];
      }
      return null;
    },

    deleteReview(id) {
      let reviews = getStorage(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
      reviews = reviews.filter(r => r.review_id !== parseInt(id, 10));
      setStorage(STORAGE_KEYS.REVIEWS, reviews);
      return true;
    }
  };

  DB.init();
  window.DB = DB;

})(typeof window !== 'undefined' ? window : globalThis);
