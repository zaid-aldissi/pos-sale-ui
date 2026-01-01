import type { Product } from "../models/pos";

export const PRODUCTS: Product[] = [
  // 🥤 Drinks
  { id: "p1", name: "Kinza-Cola 330ml", price: 0.5, barcode: "8901234567001", category: "Drinks" },
  { id: "p2", name: "Water 500ml", price: 0.35, barcode: "8901234567002", category: "Drinks" },
  { id: "p3", name: "Water 1.5L", price: 0.75, barcode: "8901234567003", category: "Drinks" },
  { id: "p4", name: "Energy Drink", price: 1.75, barcode: "8901234567027", category: "Drinks" },
  { id: "p5", name: "Juice Orange", price: 1.0, barcode: "8901234567028", category: "Drinks" },
  { id: "p6", name: "Juice Apple", price: 1.0, barcode: "8901234567029", category: "Drinks" },

  // ☕ Coffee
  { id: "p7", name: "Coffee (Small)", price: 1.0, barcode: "8901234567008", category: "Coffee" },
  { id: "p8", name: "Coffee (Large)", price: 1.5, barcode: "8901234567009", category: "Coffee" },
  { id: "p9", name: "Tea Cup", price: 0.75, barcode: "8901234567010", category: "Coffee" },

  // 🍪 Snacks
  { id: "p10", name: "Chips (Salted)", price: 0.75, barcode: "8901234567004", category: "Snacks" },
  { id: "p11", name: "Chips (Cheese)", price: 0.75, barcode: "8901234567005", category: "Snacks" },
  { id: "p12", name: "Chocolate Bar", price: 0.6, barcode: "8901234567006", category: "Snacks" },
  { id: "p13", name: "Chocolate Wafer", price: 0.55, barcode: "8901234567007", category: "Snacks" },
  { id: "p14", name: "Cookies Pack", price: 1.5, barcode: "8901234567026", category: "Snacks" },
  { id: "p15", name: "Chewing Gum", price: 0.25, barcode: "8901234567034", category: "Snacks" },

  // 🍰 Desserts
  { id: "p16", name: "Ice Cream Cup", price: 1.25, barcode: "8901234567021", category: "Desserts" },
  { id: "p17", name: "Ice Cream Cone", price: 1.0, barcode: "8901234567022", category: "Desserts" },
  { id: "p18", name: "Donut", price: 0.9, barcode: "8901234567023", category: "Desserts" },
  { id: "p19", name: "Croissant", price: 1.1, barcode: "8901234567024", category: "Desserts" },
  { id: "p20", name: "Muffin", price: 1.2, barcode: "8901234567025", category: "Desserts" },

  // 🥪 Food
  { id: "p21", name: "Sandwich Chicken", price: 2.25, barcode: "8901234567011", category: "Food" },
  { id: "p22", name: "Sandwich Cheese", price: 1.75, barcode: "8901234567012", category: "Food" },
  { id: "p23", name: "Hot Dog", price: 2.0, barcode: "8901234567017", category: "Food" },
  { id: "p24", name: "Wrap Chicken", price: 3.25, barcode: "8901234567040", category: "Food" },
  { id: "p25", name: "Wrap Falafel", price: 2.75, barcode: "8901234567041", category: "Food" },
  { id: "p26", name: "Falafel Sandwich", price: 1.5, barcode: "8901234567042", category: "Food" },

  // 🍽️ Meals
  { id: "p27", name: "Rice Meal", price: 4.5, barcode: "8901234567045", category: "Meals" },
  { id: "p28", name: "Chicken Meal", price: 5.5, barcode: "8901234567046", category: "Meals" },
  { id: "p29", name: "Beef Meal", price: 6.0, barcode: "8901234567047", category: "Meals" },
  { id: "p30", name: "Kids Meal", price: 3.75, barcode: "8901234567048", category: "Meals" },
];
