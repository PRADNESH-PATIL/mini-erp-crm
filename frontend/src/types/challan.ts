export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  customerId: string;
  createdById: string;
  totalQuantity: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  items: ChallanItem[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ChallanFormItem {
  productId: string;
  quantity: number;
}

export interface ChallanFormData {
  customerId: string;
  items: ChallanFormItem[];
}