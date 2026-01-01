# POS Sale UI – Cashier-Oriented Frontend

A focused Point-of-Sale sale screen built to explore **cashier ergonomics, flow clarity, and real-world usage patterns**.

This is not a full POS system. It's a deliberate study of how a sale screen should behave when used continuously in a real retail environment.

🚀 **[Live Demo](https://pos-sale-ui.netlify.app/)** | 📦 **[Repository](https://github.com/zaid-aldissi/pos-sale-ui)**

---

## 📸 Preview

![POS Sale UI Interface](https://i.postimg.cc/c1PZfxJ1/Macbook-Air-pos-sale-ui-netlify-app.png)

---

## Purpose

The goal was not to build features for the sake of features.

Instead, this project explores:
- How a cashier moves through a sale
- How interruptions are handled (parked sales)
- How mistakes are prevented (confirmations)
- How the UI behaves after hours of repetitive use

All data is mocked. Persistence is handled via LocalStorage.

---

## Design Philosophy

> A POS interface should be **predictable, calm, and fast**.  
> If the cashier notices the UI, something is wrong.

**Core Principles:**
- Fixed layouts to support muscle memory
- Minimal visual noise
- Clear action hierarchy
- Keyboard and barcode-first workflows

---

## Key Product Decisions

### 1. Fixed Product Grid (Muscle Memory)
Product positions **never change**.

Categories filter the grid. Search works through an overlay instead of rearranging items.  
This allows cashiers to rely on spatial memory rather than visual scanning.

### 2. Search Without Disruption
Search results appear in a dropdown overlay.  
Selecting a product adds it to cart and clears the search automatically.

The grid remains untouched at all times.

### 3. Barcode Scanner Support
Rapid keyboard input is detected as a barcode scan.  
Products are added instantly with visual confirmation.

This allows the interface to work naturally with real POS hardware.

### 4. Sale States Instead of Screens
Sales move through simple states:
- **Draft** – Active sale in progress
- **Parked** – Temporarily saved during interruptions
- **Completed** – Finished and recorded in history

This model reflects real cashier workflows more accurately than page-based navigation.

### 5. Parked Sales with Protection
Sales can be safely parked and resumed later.

Resuming a parked sale protects the current cart to avoid accidental data loss.

### 6. Error Prevention
Destructive actions are:
- Visually de-emphasized (gray, not red)
- Always confirmed with dialogs
- Disabled when cart is empty

Primary actions are clear, consistent, and fast.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` or `F3` | Focus search |
| `Enter` | Complete sale |
| `P` | Park sale |
| `ESC` | Clear search OR cancel sale (context-aware) |
| Fast typing | Auto-detected as barcode scan |

---

## Cashier Ergonomics

The interface is designed to reduce friction during repetitive use:

✅ **Automatic Focus** – Search is always ready for the next action  
✅ **Stable Layout** – No visual shifting or jumping  
✅ **Clear Feedback** – Color-coded toasts for every action  
✅ **Last Item Highlight** – Green background on most recent cart addition  
✅ **Live Clock** – Real-time date and time in header  
✅ **Hidden Scrollbars** – Clean interface while maintaining functionality

The UI assumes the cashier is working quickly, not exploring.

---

## ✨ Core Features

### Product Management
- Live product data from [FakeStore API](https://fakestoreapi.com)
- 5-column responsive grid
- Dynamic categories from API
- Smart search (name, ID, category)

### Sales Flow
- Single-click or barcode add to cart
- Quick quantity controls (±)
- Real-time JOD currency formatting
- Instant sale completion
- Park up to multiple sales simultaneously

### Visual System
- **Success** – Green (sale completed, item added)
- **Warning** – Amber (sale parked)
- **Error** – Red (failed operations)
- **Info** – Gray (neutral actions)

All toasts auto-dismiss after 2.2 seconds.

---

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Fast dev + HMR)
- Tailwind CSS 3

**Data:**
- [FakeStore API](https://fakestoreapi.com/products) – 30 real products
- LocalStorage – Drafts, parked sales, history

**State:**
- React Hooks (useState, useEffect, useMemo, useRef)
- No external state libraries

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/zaid-aldissi/pos-sale-ui.git
cd pos-sale-ui
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173`

### Production Build
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
│   ├── index.css            # Global styles + hidden scrollbars
│   ├── models/pos.ts        # TypeScript types
│   └── utils/storage.ts     # LocalStorage utilities
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind config
└── tsconfig.json            # TypeScript strict mode
```

---

## ⚙️ Configuration

### Change Currency
In `App.tsx` → `money()` function:
```typescript
currency: "JOD"  // Change to USD, EUR, etc.
```

### Adjust Grid Columns
In `App.tsx` → Product Grid:
```tsx
className="grid grid-cols-5 gap-3"  // cols-4, cols-6, etc.
```

### Swap API
In `App.tsx` → fetch useEffect:
```typescript
fetch('https://fakestoreapi.com/products')  // Use your API
```

---

## 🚦 Scope

### ✅ Included
- Product browsing and selection
- Cart management with quantity controls
- Sale completion and parking
- Keyboard shortcuts and barcode support
- Data persistence and recovery

### ❌ Intentionally Excluded
This is a **sale screen only**, not a complete POS system:
- Payment processing
- Discounts/promotions
- Receipt printing
- User authentication
- Inventory management
- Multi-location support

---

## 🎯 Performance Optimizations

- **Memoized calculations** – Prevents unnecessary re-renders
- **Single keyboard listener** – Uses refs to avoid stale closures
- **Debounced barcode detection** – 100ms buffer window
- **Lazy loading images** – Optimized API product images
- **Efficient cart updates** – Minimal state changes

---

## 📌 Final Notes

This POS interface prioritizes **cashier experience over administrative features**.

Every design decision was made to reduce friction during high-pressure, high-volume sales scenarios.

**Built with attention to:**
- Muscle memory (fixed layouts)
- Speed (keyboard-first)
- Reliability (error prevention)
- Clarity (minimal cognitive load)

---

## 🤖 Use of AI Tools

AI tools were used during development to explore UX patterns, validate POS design decisions, and review edge cases.  
All final decisions, structure, and implementation choices were made manually.

---

## 👨‍💻 Author

**Zaid Aldissi**  
GitHub: [@zaid-aldissi](https://github.com/zaid-aldissi)

---

## 📄 License

MIT License – Free to use in personal or commercial projects.
