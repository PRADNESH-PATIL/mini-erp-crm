export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  minStockAlert?: number | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  minStockAlert?: number;
  location?: string;
}

export interface StockMovement {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string | null;
  productId: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}