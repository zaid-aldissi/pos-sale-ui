# POS Sale UI – Cashier-First Design

A Point-of-Sale sale screen focused on **speed, clarity, and real cashier workflows**.  
This project prioritizes usability under pressure rather than visual flair.

---

## 🎯 Design Philosophy

> A good POS UI should be **boring, fast, and invisible**.  
> The cashier should never think about the interface — it just works.

Key principles:
- Muscle memory over dynamic layouts
- Keyboard and barcode-first workflows
- Error prevention over feature density
- Minimal cognitive load

---

## ✅ Key UX Decisions

### 1. Fixed Product Grid (Muscle Memory)
- Product positions never change
- Searching does **not** rearrange the grid
- Enables fast, repetitive actions without visual scanning

### 2. Search Overlay (Non-Disruptive)
- Search results appear in a dropdown overlay
- Grid remains untouched
- Selecting a result adds to cart and clears search

### 3. Barcode Scanner Support
- Detects rapid keyboard input (scanner behavior)
- Auto-adds matching products
- Provides instant visual feedback
- No configuration required

### 4. Keyboard-First Workflow
- `/` or `F3` → focus search
- `Enter` → complete sale
- `P` → park sale
- `ESC` → clear search or cancel sale (with confirmation)

### 5. Auto-Focus Logic
- Search is always ready for the next action
- After adding an item, focus returns automatically
- Optimized for continuous scanning

### 6. Clear Visual Feedback
- Product card flashes when added
- Last added item highlighted in cart
- Prevents double-scan mistakes

### 7. Park Sale Flow
- Sales can be parked safely during interruptions
- Parked sales are clearly visible and restorable
- Destructive actions are confirmed and visually de-emphasized

---

## 🧠 UX Principles Applied

- **Fitts’s Law**: Large touch targets for frequent actions
- **Cognitive Load Reduction**: Single screen, predictable layout
- **Muscle Memory**: Fixed positions and consistent shortcuts
- **Error Prevention**: Confirmations, visual feedback
- **Speed Optimization**: Zero unnecessary clicks

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|-------|
| `/` or `F3` | Focus search |
| `Enter` | Complete sale |
| `P` | Park sale |
| `ESC` | Clear search or cancel sale |
| Fast typing | Barcode scanner detection |

---

## 🚀 Scope Note

This project intentionally focuses on the **sale screen only**.  
Features such as payments, discounts, receipts, and permissions are out of scope.

---

## 🛠 Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- LocalStorage (mock persistence)

---

## 📌 Final Note

This UI is designed to support **real retail pressure**, interruptions, and repetitive workflows — not demos or marketing screens.