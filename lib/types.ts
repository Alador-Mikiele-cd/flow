export type Category = "girls" | "kids";

export interface Design {
  _id: string;
  code: string;
  name: string;
  category: Category;

  // Girls = 5 pieces per sirey
  // Kids = 6 pieces per sirey
  piecesPerSirey: number;

  // Price of ONE shoe/piece
  price: number;

  // Total stock = shop + storage
  stock: number;

  // Stock currently available in the shop
  shopStock: number;

  // Stock currently in the storage place
  storageStock: number;

  lowStockThreshold: number;
  image?: string;
  sizes?: string[];
  colors?: string[];
  createdAt: string;
}

export interface StockMovement {
  _id: string;
  designId: string;
  designCode: string;

  type:
    | "shipment"
    | "sale"
    | "transfer"
    | "adjustment";

  quantity: number;

  // Where stock is coming from / going to
  from?: "storage" | "shop";
  to?: "storage" | "shop";

  note?: string;
  createdAt: string;
}

export interface SaleItem {
  designId: string;
  code: string;
  name: string;
  category: Category;

  // Number of sireys sold
  quantity: number;

  // Price of one shoe/piece
  price: number;

  // 5 for girls, 6 for kids
  piecesPerSirey: number;

  // quantity × price × piecesPerSirey
  subtotal: number;
}

export interface Sale {
  _id: string;
  receiptNumber: number;

  items: SaleItem[];

  // Total number of sireys sold
  totalQuantity: number;

  // Total number of individual shoes/pieces
  totalPieces: number;

  // Final sale amount
  total: number;

  paymentMethod:
    | "cash"
    | "telebirr"
    | "bank";

  // What customer has paid so far
  amountReceived: number;

  // Money returned when customer pays more than total
  change: number;

  // Money still owed
  balanceDue: number;

  createdAt: string;
}