# POS Sale UI – Modern Cashier Interface

A production-ready Point-of-Sale sale screen built with **speed, usability, and real-world workflows** in mind.  
Designed for cashiers who need a fast, reliable interface under pressure.

---

## 🎯 Design Philosophy

> A good POS UI should be **boring, fast, and invisible**.  
> The cashier should never think about the interface it just works.

**Core Principles:**
- Muscle memory over dynamic layouts
- Keyboard and barcode-first workflows  
- Error prevention over feature density
- Minimal cognitive load with maximum efficiency

---

## ✨ Features

### Product Management
- **Live Product Data**: Integrates with [FakeStore API](https://fakestoreapi.com) for real product catalog
- **5-Column Grid Layout**: Optimized for screen space and visibility
- **Dynamic Categories**: Auto-generated from API product data
- **Smart Search**: Searches by product name, ID, or category
- **Product Name Truncation**: Shows first 3 words for clean display
- **Lazy Loading Images**: Optimized performance with loading states

### Sales Operations
- **Fast Add to Cart**: Single click or barcode scan
- **Quantity Management**: Quick increment/decrement controls
- **Real-time Subtotal**: Live calculation with JOD currency formatting
- **Sale Completion**: Instant transition to new sale
- **Park Sales**: Save up to 5 active sales for later
- **Sale Cancellation**: Protected by confirmation dialog

### UI/UX Enhancements
- **Live Clock**: Real-time date and time in header
- **Hidden Scrollbars**: Clean interface while maintaining scroll functionality
- **Sticky Navigation**: Search and categories stay visible while scrolling
- **Color-Coded Toasts**: Success (green), Error (red), Warning (amber), Info (gray)
- **Custom Confirmations**: Professional dialogs instead of browser alerts
- **Last Added Highlight**: Green background on most recent cart item
- **Responsive Layout**: 2/3 products, 1/3 cart panel

### Data Persistence
- **LocalStorage**: Automatic draft saving
- **Parked Sales**: Persistent across sessions (max 5)
- **Sale History**: Tracks last 5 completed sales
- **Auto-Recovery**: Restores draft on page reload

### Performance Optimizations
- **Memoized Calculations**: Prevents unnecessary re-renders
- **Optimized Event Listeners**: Single keyboard listener with refs
- **Debounced Barcode Scanning**: 100ms detection window
- **Efficient State Management**: Minimal re-renders on cart updates

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` or `F3` | Focus search bar |
| `Enter` | Complete sale (requires items) |
| `P` | Park current sale |
| `ESC` | Clear search OR cancel sale (context-aware) |
| Fast typing | Barcode scanner auto-detection |

---

## 🧠 UX Design Principles

### 1. Fixed Product Grid (Muscle Memory)
- Categories filter products, search shows overlay
- Product positions remain consistent for speed
- Enables repetitive actions without visual scanning

### 2. Non-Disruptive Search
- Search results appear in dropdown overlay
- Grid stays untouched during search
- Selecting adds to cart and clears search automatically

### 3. Barcode Scanner Support
- Detects rapid keyboard input (100ms buffer)
- Auto-matches by product ID or name
- Instant toast feedback on scan
- Zero configuration required

### 4. Visual Feedback System
- **Green highlight**: Last added item in cart
- **Toast notifications**: All actions confirmed visually
- **Loading states**: Products fetch feedback
- **Disabled states**: Prevents invalid actions

### 5. Error Prevention
- Confirmation dialogs for destructive actions
- Disabled buttons when cart is empty
- Clear messaging for all operations
- No silent failures

### 6. Park Sale Workflow
- Visual parked sales panel (🅿️ button)
- Shows sale time + relative time ("15 minutes ago")
- Resume with current cart protection
- Individual or bulk clear options

---

## 🛠 Tech Stack

**Frontend Framework:**
- React 18 (Functional Components + Hooks)
- TypeScript (Strict Mode)
- Vite (Fast Development + HMR)

**Styling:**
- Tailwind CSS 3
- Custom CSS (Hidden Scrollbars)
- Responsive Design

**Data Sources:**
- [FakeStore API](https://fakestoreapi.com/products) (30 Products)
- LocalStorage (Persistence)

**State Management:**
- React Hooks (useState, useEffect, useMemo, useRef)
- No external state libraries

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zaid-aldissi/pos-sale-ui.git
cd pos-sale-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
pos-ui/
├── src/
│   ├── App.tsx              # Main POS application
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles + scrollbar hiding
│   ├── models/
│   │   └── pos.ts           # TypeScript types/interfaces
│   ├── utils/
│   │   └── storage.ts       # LocalStorage utilities
│   └── assets/              # Static assets
├── public/                  # Public static files
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── tailwind.config.js       # Tailwind config
```

---

## 🎨 UI Components

### Header
- Sale number with live date/time
- Parked sales button (shows count)
- Real-time subtotal display

### Product Section (2/3 width)
- Search bar with clear button
- Category filter buttons
- 5-column responsive grid
- Product cards with images + prices

### Cart Panel (1/3 width)
- Scrollable cart items (newest on top)
- Increment/decrement buttons
- Subtotal, quantity, and total summary
- Complete Sale (2/3 width, green)
- Park (1/3 width, amber)
- Cancel Sale (full width, gray)

### Modals
- **Parked Sales**: 4-column grid with resume/clear actions
- **Confirmation Dialog**: Amber warning icon with cancel/confirm

### Toasts
- Auto-dismiss after 2.2 seconds
- SVG icons for each type
- Fixed bottom-center position

---

## 🔧 Configuration

### Currency Format
Change in `App.tsx` → `money()` function:
```typescript
currency: "JOD"  // Change to USD, EUR, etc.
```

### Product Grid Columns
Change in `App.tsx` → Product Grid section:
```tsx
className="grid grid-cols-5 gap-3"  // Change cols-5 to cols-4, cols-6, etc.
```

### API Endpoint
Change in `App.tsx` → fetch useEffect:
```typescript
fetch('https://fakestoreapi.com/products')  // Replace with your API
```

---

## 🚦 Scope & Limitations

**In Scope:**
- Product browsing and selection
- Cart management
- Sale completion and parking
- Keyboard shortcuts
- Barcode scanning
- Data persistence

**Out of Scope:**
- Payment processing
- Discounts/promotions
- Receipt printing
- User authentication
- Multi-location support
- Inventory management
- Reporting/analytics

---

## 🐛 Known Issues

- API categories don't match local `ProductCategory` type (works via dynamic casting)
- No offline mode (requires internet for product loading)
- Maximum 5 parked sales enforced

---

## 🤝 Contributing

This is a learning/demonstration project. Feel free to fork and customize for your needs.

---

## 📄 License

MIT License - Feel free to use in personal or commercial projects.

---

## 👨‍💻 Author

**Zaid Aldissi**  
GitHub: [@zaid-aldissi](https://github.com/zaid-aldissi)

---

## 📌 Final Notes

This POS interface prioritizes **cashier experience over administrative features**.  
Every design decision was made to reduce friction during high-pressure, high-volume sales scenarios.

**Built with attention to:**
- Accessibility (keyboard navigation)
- Performance (memoization, optimized renders)
- Reliability (error handling, confirmations)
- Speed (minimal clicks, instant feedback)
