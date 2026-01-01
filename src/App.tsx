import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS } from "./data/products";
import type { Product, ProductCategory, SaleDraft } from "./models/pos";
import productPlaceholder from "./assets/tag-line-svgrepo-com.svg";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  loadParked,
  saveParked,
  loadHistory,
  saveHistory,
  getNextSaleNumber,
} from "./utils/storage";

/* ================= helpers ================= */

function money(n: number) {
  return new Intl.NumberFormat("en-JO", {
    style: "currency",
    currency: "JOD",
    maximumFractionDigits: 2,
  }).format(n);
}

function now() {
  return Date.now();
}

function minutesAgo(ts: number) {
  const diffMs = now() - ts;
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins <= 0) return "just now";
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

function createNewSale(): SaleDraft {
  const t = now();
  return {
    id: crypto.randomUUID(),
    saleNumber: getNextSaleNumber(),
    status: "draft",
    createdAt: t,
    lastUpdatedAt: t,
    items: [],
  };
}

type SaleHistoryItem = {
  saleNumber: number;
  completedAt: number;
  itemsCount: number;
  total: number;
};

/* ================= App ================= */

const categories: (ProductCategory | "All")[] = [
  "All",
  "Drinks",
  "Coffee",
  "Snacks",
  "Food",
  "Desserts",
  "Meals",
];

export default function App() {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const barcodeBufferRef = useRef<string>("");
  const barcodeTimerRef = useRef<number | null>(null);

  const [query, setQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showParkedSales, setShowParkedSales] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "All">("All");
  const [sale, setSale] = useState<SaleDraft>(
    () => loadDraft<SaleDraft>() ?? createNewSale()
  );
  const [parkedSales, setParkedSales] = useState<SaleDraft[]>(
    () => loadParked<SaleDraft[]>() ?? []
  );
  const [history, setHistory] = useState<SaleHistoryItem[]>(
    () => loadHistory<SaleHistoryItem[]>() ?? []
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const cartItems = sale.items;

  // Filtered products based on active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  // Search results for dropdown (not filtering main grid)
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((p) => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      p.barcode.includes(q)
    );
  }, [query]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.unitPrice * it.qty, 0),
    [cartItems]
  );

  /* ================= persistence ================= */

  useEffect(() => saveDraft(sale), [sale]);
  useEffect(() => saveParked(parkedSales), [parkedSales]);
  useEffect(() => saveHistory(history), [history]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ================= auto-focus ================= */

  useEffect(() => {
    // Auto-focus search on mount
    searchRef.current?.focus();
  }, []);

  /* ================= keyboard shortcuts + barcode scanner ================= */

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      // Barcode scanner detection (rapid typing)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBufferRef.current += e.key;
        
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        
        barcodeTimerRef.current = window.setTimeout(() => {
          const barcode = barcodeBufferRef.current;
          if (barcode.length > 3) {
            // Try to find product by barcode, ID, or name
            const product = PRODUCTS.find(p => 
              p.barcode === barcode ||
              p.id.toLowerCase() === barcode.toLowerCase() ||
              p.name.toLowerCase().includes(barcode.toLowerCase())
            );
            if (product && !isTypingTarget(e.target)) {
              addToCart(product);
              setToast({ message: product.name, type: "success" });
            }
          }
          barcodeBufferRef.current = "";
        }, 100);
      }

      // Focus search with / or F3
      if ((e.key === "/" || e.key === "F3") && !isTypingTarget(e.target)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      // ESC behavior
      if (e.key === "Escape") {
        if (isTypingTarget(e.target)) {
          // Clear search if in search input
          setQuery("");
          setShowSearchResults(false);
          // Keep focus on search instead of blurring
          e.preventDefault();
        } else {
          // Clear sale if not typing + clear barcode buffer
          barcodeBufferRef.current = "";
          clearSale();
        }
        return;
      }

      if (isTypingTarget(e.target)) return;

      // Enter completes the sale
      if (e.key === "Enter") completeSale();
      if (e.key.toLowerCase() === "p") parkSale();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
    };
  }, [sale.items.length]);

  /* ================= actions ================= */

  function addToCart(product: Product) {
    setSale((prev) => {
      const idx = prev.items.findIndex((x) => x.productId === product.id);
      const items =
        idx >= 0
          ? prev.items.map((it, i) =>
              i === idx ? { ...it, qty: it.qty + 1 } : it
            )
          : [
              ...prev.items,
              {
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                qty: 1,
              },
            ];

      return { ...prev, items, lastUpdatedAt: now() };
    });
    
    // Clear search and close dropdown
    setQuery("");
    setShowSearchResults(false);
  }

  function inc(id: string) {
    setSale((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.productId === id ? { ...it, qty: it.qty + 1 } : it
      ),
      lastUpdatedAt: now(),
    }));
  }

  function dec(id: string) {
    setSale((prev) => ({
      ...prev,
      items: prev.items
        .map((it) => (it.productId === id ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0),
      lastUpdatedAt: now(),
    }));
  }

  function clearSale() {
    setConfirmDialog({
      message: "Clear current sale?",
      onConfirm: () => {
        setSale((prev) => ({
      ...prev,
      items: [],
      status: "draft",
      lastUpdatedAt: now(),
        }));
        clearDraft();
        setToast({ message: "Cleared", type: "info" });
        setActiveCategory("All");
        setConfirmDialog(null);
      },
    });
  }

  function completeSale() {
    if (cartItems.length === 0) return setToast({ message: "Cart is empty", type: "info" });

    setSale((prev) => ({ ...prev, status: "completed" }));

    setHistory((prev) =>
      [
        {
          saleNumber: sale.saleNumber,
          completedAt: now(),
          itemsCount: cartItems.reduce((s, i) => s + i.qty, 0),
          total: subtotal,
        },
        ...prev,
      ].slice(0, 5)
    );

    clearDraft();
    setToast({ message: "Completed", type: "success" });
    setActiveCategory("All");

    setTimeout(() => setSale(createNewSale()), 450);
  }

  function parkSale() {
    if (cartItems.length === 0) return setToast({ message: "Cart is empty", type: "warning" });
    setParkedSales((p) => [
      { ...sale, status: "parked", lastUpdatedAt: now() },
      ...p,
    ]);
    clearDraft();
    setSale(createNewSale());
    setActiveCategory("All");
    setToast({ message: "Parked", type: "warning" });
  }

  function restoreParkedSale(parkedSale: SaleDraft) {
    const doRestore = () => {
      setSale({ ...parkedSale, status: "draft", lastUpdatedAt: now() });
      setParkedSales((p) => p.filter((s) => s.id !== parkedSale.id));
      setShowParkedSales(false);
      setToast({ message: "Restored", type: "success" });
      setActiveCategory("All");
      setConfirmDialog(null);
    };

    if (cartItems.length > 0) {
      setConfirmDialog({
        message: "Current sale has items. Restoring will replace it. Continue?",
        onConfirm: doRestore,
      });
    } else {
      doRestore();
    }
  }

  function deleteParkedSale(id: string) {
    setConfirmDialog({
      message: "Delete this parked sale?",
      onConfirm: () => {
        setParkedSales((p) => {
          const updated = p.filter((s) => s.id !== id);
          // Close panel if no more parked sales
          if (updated.length === 0) {
            setShowParkedSales(false);
          }
          return updated;
        });
        setToast({ message: "Deleted", type: "error" });
        setConfirmDialog(null);
      },
    });
  }

  function deleteAllParkedSales() {
    setConfirmDialog({
      message: `Delete all ${parkedSales.length} parked sales? This cannot be undone.`,
      onConfirm: () => {
        setParkedSales([]);
        setShowParkedSales(false);
        setToast({ message: "All deleted", type: "error" });
        setConfirmDialog(null);
      },
    });
  }

  /* ================= UI ================= */

  return (
    <div className="h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm font-semibold">
              Sale #{sale.saleNumber} • {sale.status.toUpperCase()}
            </div>
            <div className="text-xs text-gray-500">
              {sale.status === "draft" &&
                `Updated ${minutesAgo(sale.lastUpdatedAt)}`}
            </div>
          </div>
          {parkedSales.length > 0 && (
            <button
              onClick={() => setShowParkedSales(!showParkedSales)}
              className="px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
            >
              🅿️ Parked ({parkedSales.length})
            </button>
          )}
        </div>
        <div className="text-xl font-extrabold">{money(subtotal)}</div>
      </header>

      {/* Body */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Products - 2/3 of screen */}
        <main className="flex-[2] flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowSearchResults(query.trim().length > 0)}
                placeholder="Search products or scan barcode... (Press / or F3)"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-medium placeholder:text-gray-400"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowSearchResults(false);
                    searchRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-500 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition flex justify-between items-center border-b last:border-b-0"
                  >
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        Barcode: {p.barcode} • ID: {p.id}
                      </div>
                    </div>
                    <div className="text-sm font-bold">{money(p.price)}</div>
                  </button>
                ))}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && query && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
                No products found for "{query}"
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-shrink-0">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold
                  ${activeCategory === c
                    ? "bg-gray-900 text-white"
                    : "bg-white border hover:bg-gray-50"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Product Grid - Filtered by category */}
          <div className="overflow-y-scroll pb-4 pr-2">
            <div className="grid grid-cols-4 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition text-left focus:outline-none"
              >
                <img
                  src={productPlaceholder}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-square w-full object-contain rounded-lg mb-2 bg-gray-100 p-4 opacity-80"
                />
                <div className="text-xs font-semibold mb-1">
                  {p.name}
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-bold">{money(p.price)}</span>
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    ADD
                  </span>
                </div>
              </button>
            ))}
            </div>
          </div>
        </main>

        {/* Order Panel - 1/3 of screen */}
        <aside className="flex-[1] bg-white rounded-2xl shadow-sm flex flex-col">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center text-sm text-gray-500 border border-dashed rounded-xl p-6">
                Cart is empty
              </div>
            ) : (
              [...cartItems].reverse().map((it, idx) => (
                <div
                  key={it.productId}
                  className={`flex justify-between items-center p-2 rounded-lg transition ${
                    idx === 0
                      ? "bg-green-50 border border-green-200"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {it.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {money(it.unitPrice)} × {it.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => dec(it.productId)}
                      className="h-9 w-9 border-2 rounded-full hover:bg-red-50 hover:border-red-300 transition font-bold text-lg flex items-center justify-center"
                    >
                      −
                    </button>
                    <div className="w-7 text-center text-base font-bold">
                      {it.qty}
                    </div>
                    <button
                      onClick={() => inc(it.productId)}
                      className="h-9 w-9 border-2 rounded-full hover:bg-green-50 hover:border-green-300 transition font-bold text-lg flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xl font-extrabold">
              <span>TOTAL</span>
              <span>{money(subtotal)}</span>
            </div>

            <button
              onClick={completeSale}
              disabled={cartItems.length === 0}
              className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
            >
              Complete Sale
            </button>

            <button
              onClick={parkSale}
              disabled={cartItems.length === 0}
              className="w-full rounded-xl py-2.5 font-semibold bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500"
            >
              Park Sale
            </button>

            <button
              onClick={clearSale}
              disabled={cartItems.length === 0}
              className="w-full text-gray-600 bg-gray-100 rounded-xl py-2.5 font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
            >
              Cancel Sale
            </button>
          </div>
        </aside>
      </div>

      {toast && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2
            ${toast.type === "success" ? "bg-green-600 text-white" : ""}
            ${toast.type === "error" ? "bg-red-500 text-white" : ""}
            ${toast.type === "warning" ? "bg-amber-500 text-white" : ""}
            ${toast.type === "info" ? "bg-gray-100 text-gray-700" : ""}
          `}
        >
          {toast.type === "success" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === "warning" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {toast.type === "info" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Parked Sales Panel */}
      {showParkedSales && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Parked Sales ({parkedSales.length})</h2>
              <div className="flex items-center gap-2">
                {parkedSales.length > 0 && (
                  <button
                    onClick={deleteAllParkedSales}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition"
                  >
                    Clear All Parked
                  </button>
                )}
                <button
                  onClick={() => setShowParkedSales(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {parkedSales.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  No parked sales
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {parkedSales.map((parked) => {
                    const parkedTotal = parked.items.reduce(
                      (sum, it) => sum + it.unitPrice * it.qty,
                      0
                    );
                    const itemCount = parked.items.reduce((s, i) => s + i.qty, 0);
                    return (
                      <div
                        key={parked.id}
                        className="border-2 border-gray-200 rounded-xl p-3 hover:border-amber-400 transition flex flex-col"
                      >
                        <div className="mb-2">
                          <div className="font-bold text-sm">
                            Sale #{parked.saleNumber}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {minutesAgo(parked.lastUpdatedAt)}
                          </div>
                          <div className="text-lg font-bold text-amber-600">
                            {money(parkedTotal)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {itemCount} items
                          </div>
                        </div>
                        <div className="space-y-1 mb-3 flex-1">
                          {parked.items.slice(0, 2).map((it) => (
                            <div
                              key={it.productId}
                              className="text-xs text-gray-600"
                            >
                              <div className="truncate font-medium">{it.name}</div>
                              <div className="text-gray-400">
                                {money(it.unitPrice)} × {it.qty}
                              </div>
                            </div>
                          ))}
                          {parked.items.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{parked.items.length - 2} more...
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => restoreParkedSale(parked)}
                            className="flex-[2] bg-green-600 text-white py-1.5 rounded-xl text-xs font-semibold hover:bg-green-700 transition"
                          >
                            Resume Sale
                          </button>
                          <button
                            onClick={() => deleteParkedSale(parked.id)}
                            className="flex-[1] border-2 border-red-300 text-red-600 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-50 transition"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirm Action</h3>
                <p className="text-sm text-gray-600">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 transition text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-600 transition text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
