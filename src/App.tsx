import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS } from "./data/products";
import type { CartItem, Product, SaleDraft, SaleStatus } from "./models/pos";
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

export default function App() {
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [sale, setSale] = useState<SaleDraft>(
    () => loadDraft<SaleDraft>() ?? createNewSale()
  );
  const [parkedSales, setParkedSales] = useState<SaleDraft[]>(
    () => loadParked<SaleDraft[]>() ?? []
  );
  const [history, setHistory] = useState<SaleHistoryItem[]>(
    () => loadHistory<SaleHistoryItem[]>() ?? []
  );
  const [toast, setToast] = useState<string | null>(null);

  const cartItems = sale.items;

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
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

  /* ================= safety ================= */

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (sale.status === "draft" && sale.items.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [sale.status, sale.items.length]);

  /* ================= keyboard shortcuts ================= */

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if (e.key === "Escape") clearSale();
      if (e.key === "Enter") completeSale();
      if (e.key.toLowerCase() === "p") parkSale();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
    searchRef.current?.focus();
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
    if (!confirm("Clear current sale?")) return;
    setSale((prev) => ({
      ...prev,
      items: [],
      status: "draft",
      lastUpdatedAt: now(),
    }));
    clearDraft();
    setToast("Sale cleared");
  }

  function completeSale() {
    if (cartItems.length === 0) return setToast("Cart is empty");

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
    setToast("Sale completed ✅");

    setTimeout(() => setSale(createNewSale()), 450);
  }

  function parkSale() {
    if (cartItems.length === 0) return setToast("Nothing to park");
    setParkedSales((p) => [
      { ...sale, status: "parked", lastUpdatedAt: now() },
      ...p,
    ]);
    clearDraft();
    setSale(createNewSale());
    setToast("Sale parked 🅿️");
  }

  /* ================= UI ================= */

  return (
    <div className="h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <div>
          <div className="text-sm font-semibold">
            Sale #{sale.saleNumber} • {sale.status.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500">
            {sale.status === "draft" &&
              `Updated ${minutesAgo(sale.lastUpdatedAt)}`}
          </div>
        </div>
        <div className="text-xl font-extrabold">{money(subtotal)}</div>
      </header>

      {/* Body */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Products */}
        <main className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition text-left active:scale-[0.98]"
              >
                <img
                  src={productPlaceholder}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-square w-full object-contain rounded-lg mb-2 bg-gray-100 p-4 opacity-80"
                />
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-semibold truncate">
                    {p.name}
                  </span>
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    ADD
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold">{money(p.price)}</div>
              </button>
            ))}
          </div>
        </main>

        {/* Order Panel */}
        <aside className="w-[360px] bg-white rounded-2xl shadow-sm flex flex-col">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center text-sm text-gray-500 border border-dashed rounded-xl p-6">
                Cart is empty
              </div>
            ) : (
              cartItems.map((it) => (
                <div
                  key={it.productId}
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-semibold truncate">
                      {it.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {money(it.unitPrice)} × {it.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dec(it.productId)}
                      className="h-10 w-10 border rounded-full"
                    >
                      −
                    </button>
                    <div className="w-6 text-center text-sm font-semibold">
                      {it.qty}
                    </div>
                    <button
                      onClick={() => inc(it.productId)}
                      className="h-10 w-10 border rounded-full"
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
              className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              Complete Sale
            </button>

            <button
              onClick={parkSale}
              disabled={cartItems.length === 0}
              className="w-full border rounded-xl py-2 text-sm font-semibold"
            >
              Park Sale
            </button>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
