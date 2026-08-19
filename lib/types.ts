export type Category = "girls" | "kids";

export interface Design {
  _id: string;
  code: string; // e.g. "S-102"
  name: string; // e.g. "Pastel strap sandal"
  category: Category;
  piecesPerSirey: number; // 5 for girls, 6 for kids
  price: number; // Birr, per sirey
  stock: number; // current sireys in stock
  lowStockThreshold: number;
  image?: string; // pasted image URL
  sizes?: string[];
  colors?: string[];
  createdAt: string;
}

export interface StockMovement {
  _id: string;
  designId: string;
  designCode: string;
  type: "shipment" | "sale" | "adjustment";
  quantity: number; // positive for shipment/adjustment-in, negative for sale
  note?: string;
  createdAt: string;
}

export interface SaleItem {
  designId: string;
  code: string;
  name: string;
  quantity: number;
  price: number; // price per sirey at time of sale
  subtotal: number;
}

export interface Sale {
  _id: string;
  receiptNumber: number;
  items: SaleItem[];
  totalQuantity: number;
  total: number;

  paymentMethod: "cash" | "telebirr" | "bank";
  amountReceived: number;
  change: number;

  createdAt: string;
}