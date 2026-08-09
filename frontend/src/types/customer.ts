export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR" | null;
  address?: string | null;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR" | "";
  address?: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate?: string;
}

export interface FollowUp {
  id: string;
  note: string;
  customerId: string;
  createdAt: string;
}