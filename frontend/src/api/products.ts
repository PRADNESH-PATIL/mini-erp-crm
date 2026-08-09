import apiClient from "./client";
import type { Product, ProductFormData, StockMovement } from "../types/product";
import type { Pagination } from "../types/common";

export const getProducts = async (
  search: string,
  page: number,
  limit = 10
) => {
  const res = await apiClient.get("/products", {
    params: { search, page, limit },
  });

  return res.data.data as {
    products: Product[];
    pagination: Pagination;
  };
};

export const getProductById = async (id: string) => {
  const res = await apiClient.get(`/products/${id}`);
  return res.data.data as Product;
};

export const createProduct = async (data: ProductFormData) => {
  const res = await apiClient.post("/products", data);
  return res.data.data as Product;
};

export const updateProduct = async (id: string, data: ProductFormData) => {
  const res = await apiClient.put(`/products/${id}`, data);
  return res.data.data as Product;
};

export const deleteProduct = async (id: string) => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const addStockMovement = async (
  productId: string,
  type: "IN" | "OUT",
  quantity: number,
  reason?: string
) => {
  const res = await apiClient.post(`/products/${productId}/stock`, {
    type,
    quantity,
    reason,
  });
  return res.data;
};

export const getStockMovements = async (productId: string) => {
  const res = await apiClient.get(`/products/${productId}/stock-movements`);
  return res.data.data as StockMovement[];
};