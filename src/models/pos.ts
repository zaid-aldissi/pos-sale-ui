export type SaleStatus = "draft" | "completed" | "parked";

export type Product = {
  id: string; // unique product identifier
  name: string; // product name
  price: number; // JOD
};

export type CartItem = {
  productId: string; // refers to Product.id
  name: string; // product name
  unitPrice: number; // JOD
  qty: number; // quantity
};

export type SaleDraft = {
  id: string; // UUID
  saleNumber: number; // Incremental
  status: SaleStatus; // "draft" | "completed" | "parked"
  createdAt: number; // timestamp
  lastUpdatedAt: number; // timestamp
  items: CartItem[]; // items in the cart
};

