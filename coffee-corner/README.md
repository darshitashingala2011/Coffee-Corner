# Coffee Corner | 3D Coffee Shop Order & Menu Management System

A luxurious, modern, and fully responsive 3D coffee shop web application crafted with **HTML5, CSS3, vanilla JavaScript, and Three.js**. Built with an elegant coffee brown, caramel, cream, and beige glassmorphic design system. Fully prepared for future integration with **PHP and MySQL**.

---

## 🌟 Live Demo & Quick Start

The project is completely static, client-side self-contained with no build steps, Node.js, or frontend frameworks required.

You can preview the website immediately using any lightweight static server:

```powershell
# Open PowerShell in the project directory:
cd "C:\Users\User\.gemini\antigravity\scratch\coffee-corner"

# Option A: Python built-in server (recommended)
python -m http.server 8000

# Option B: Node static server (if installed)
npx serve .
```

Open your browser at:
`http://localhost:8000` (or double-click `index.html` to open directly in Chrome/Edge/Firefox).

---

## ☕ Demo Accounts & Authentication Rule

### Guest Browsing Rule
- **Guests can freely browse** all public pages: Home, Menu catalog, About Us, Contact, and Customer Reviews without logging in.
- Customers can add items to the cart and customize drinks as a guest.
- **Login/Registration is required only when attempting to place an order** or when navigating to the Customer Dashboard.

### 1. Customer Demo Account
- **Email:** `sarah@coffeecorner.com`
- **Password:** `password123`
- *Features 480 VIP Bean Points, Seattle shipping profile, and live order tracking.*
- *A **1-Click Demo Login** button is also provided on all sign-in modals and forms.*

### 2. Admin Portal (`admin.html`)
- **URL:** [admin.html](admin.html) (or click **Admin** in the navigation header)
- **Admin Email:** `admin@coffeecorner.com`
- **Admin Password:** `admin123`
- *Accesses full store operations, order fulfillment, menu inventory, staff scheduling, customer accounts, and payment transactions.*

---

## 🎨 Design & 3D Interactive Features

- **Three.js 3D Coffee Cup Hero Section (`assets/js/three-hero.js`):**
  - High-polygon ceramic cup with tapered rim, ergonomic handle, and gold-trimmed porcelain saucer.
  - Realistic metallic stirring spoon with dual-segment bowl and handle resting inside the saucer.
  - Procedural 3D coffee beans with distinct center crevices, scattered and orbiting with subtle gravitational wobble.
  - Rising 3D steam particle simulation with progressive alpha dissipation and turbulent drift.
  - Dynamic procedural Latte Art canvas texture with micro-foam patterns.
  - Mouse & touch 360° drag interaction with smooth rotational inertia.
  - **Live 4-Flavor Switcher:** Seamlessly morph between *Caramel Velvet Macchiato*, *Artisan Cortado Royale*, *Uji Matcha Latte*, and *Smoky Dark Roast* with dynamic cup glaze, foam coloration, and ambient illumination.
- **Luxury Aesthetic & Micro-Interactions (`assets/css/style.css`):**
  - Rich coffee brown (`#120904`), warm caramel (`#d49b6a`), cream (`#fcf9f2`), and beige accents.
  - Glassmorphic panels with multi-layered blur, gold glow borders, and subtle depth shadows.
  - Floating slide-over cart drawer with real-time badges, item customization breakdowns, and promo code support (`CORNER10`, `FIRSTCUP`).
  - Interactive drink customization modal: Cup size (*12oz, 16oz, 20oz*), milk choices (*Oat, Whole, Almond, Coconut*), sweetness level (*0% to 100%*), and extra espresso shots.
  - Interactive 5-star customer rating widget with category moderation.
  - Live 4-step order fulfillment progress stepper: *Pending &rarr; Preparing &rarr; Ready &rarr; Delivered*.
  - Interactive 3D credit card preview with real-time cardholder and card number synchronization.

---

## 📄 Pages Included (11 Customer Pages + Admin Portal)

### Customer Side
1. **Home (`index.html`):** 3D coffee cup hero with live flavor switcher, welcome message, featured drinks, special promotions banner, roasting pillars, customer testimonials, and newsletter footer.
2. **About Us (`about.html`):** Coffee Corner heritage story, bean sourcing principles, master baristas & chefs, and sustainability manifesto.
3. **Contact Us (`contact.html`):** Customer inquiries form, roastery location, phone/email details, interactive simulated cafe map, and FAQ accordion.
4. **Products & Menu (`menu.html`):** Comprehensive catalog across Coffee, Cold Drinks, Artisan Teas, Snacks, Gourmet Desserts, and Whole Beans with live search, category pills, price sorting, and drink customizer modal.
5. **Login & Sign Up (`login.html`):** Modern tabbed authentication, field validation, 1-click customer demo autofill, and link to staff gateway.
6. **Customer Dashboard (`dashboard.html`):** Welcome banner, VIP Bean Rewards progress bar, customer profile/address manager, and recent order history.
7. **Cart (`cart.html`):** Itemized breakdown, quantity adjusters, item removal, promo vouchers (`CORNER10`), delivery fee threshold calculator, and checkout CTA.
8. **Checkout (`checkout.html`):** Delivery address details, interactive credit card preview, Apple Pay / Cash on Delivery payment tabs, order recap, and secure submission.
9. **Order Confirmation (`order-success.html`):** Celebratory confetti animation, pulsing checkmark, generated order ticket number (`CC-XXXXX`), 25-minute live countdown timer, and printable receipt.
10. **My Orders (`orders.html`):** Order history with live 4-step preparation stepper (*Pending &rarr; Preparing &rarr; Ready &rarr; Delivered*) and 1-click reorder.
11. **Feedback & Reviews (`feedback.html`):** Interactive 5-star rating selector, category tagger, review submission, and community review feed with helpful votes.

### Admin Side
12. **Admin Portal (`admin.html`):**
    - **Dashboard Overview:** Key metrics (Total Revenue, Total Orders, Active Customers, Rating), weekly sales revenue bar chart, and active kitchen ticket queue.
    - **Order Management:** Complete order fulfillment ledger with real-time status updates (*Pending*, *Preparing*, *Ready*, *Delivered*, *Cancelled*) and filtering.
    - **Menu & Catalog Management:** Add new items, edit pricing, toggle in-stock availability, and delete products.
    - **Customer Reviews Moderation:** Approve, reject, or archive customer reviews.
    - **Employee Management:** Staff roster, roles (*Store Manager, Head Barista, Pastry Chef, Cashier*), **Morning Shift (06:00 - 14:00)** and **Evening Shift (14:00 - 22:00)** scheduling, hourly wages, and onboarding modal.
    - **Customer & Payment Ledger:** Registered customer profiles with loyalty bean points and full transaction payment records.

---

## 🗄️ Database Architecture (9 MySQL Tables)

The client-side database service (`assets/js/db.js`) is designed to match the production MySQL schema in `sql/schema.sql` 1:1:

1. **`CUSTOMERS`**: Account details, hashed passwords, loyalty bean balance, shipping profile.
2. **`CATEGORIES`**: Drink and food groupings (*Hot Coffee, Cold Drinks, Artisan Teas, Artisanal Snacks, Gourmet Desserts, Whole Bean Reserves*).
3. **`MENU_ITEMS`**: Names, prices, category IDs, roast levels, calorie counts, flavor notes, availability flags.
4. **`CART`**: Session cart container linked to customer or guest session with promo discount.
5. **`CART_ITEMS`**: Selected menu item IDs, quantities, cup sizes (*12oz, 16oz, 20oz*), milk choices (*Whole, Oat, Almond, Coconut*), sweetness %, extra shot flags.
6. **`ORDERS`**: Unique order codes (*CC-XXXXX*), fulfillment status (*Pending, Preparing, Ready, Delivered, Cancelled*), totals, delivery instructions.
7. **`ORDER_DETAILS`**: Itemized lines, unit pricing, customizations snapshots.
8. **`EMPLOYEES`**: Staff roles, contact details, shifts (**Morning Shift**, **Evening Shift**), hourly rates, employment status.
9. **`PAYMENTS`**: Transaction codes, order IDs, payment methods (*Credit Card, Apple Pay, Cash on Delivery*), amounts, timestamps.
10. **`REVIEWS`**: Customer star ratings (1–5), categories, review comments, moderation status (*Approved, Pending, Rejected*).

---

## 💡 Future PHP & MySQL Integration Guide

Every service method in `assets/js/db.js` corresponds directly to an API endpoint:
- **`sql/schema.sql`**: Execute directly in MySQL/phpMyAdmin to instantiate all 9 relational tables, foreign key constraints, indexes, and initial seeds.
- To connect to a live PHP backend, simply replace the `localStorage` getters/setters in `assets/js/db.js` with standard `fetch('api/endpoint.php')` calls. No HTML, CSS, or UI logic needs to be rewritten.
