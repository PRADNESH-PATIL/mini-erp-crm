import apiClient from "./client";
import type { Customer, CustomerFormData, FollowUp } from "../types/customer";
import type { Pagination } from "../types/common";

export const getCustomers = async (
  search: string,
  page: number,
  limit = 10
) => {
  const res = await apiClient.get("/customers", {
    params: { search, page, limit },
  });

  return res.data.data as {
    customers: Customer[];
    pagination: Pagination;
  };
};

export const getCustomerById = async (id: string) => {
  const res = await apiClient.get(`/customers/${id}`);
  return res.data.data as Customer & { followUps: FollowUp[] };
};

export const createCustomer = async (data: CustomerFormData) => {
  const res = await apiClient.post("/customers", data);
  return res.data.data as Customer;
};

export const updateCustomer = async (
  id: string,
  data: CustomerFormData
) => {
  const res = await apiClient.put(`/customers/${id}`, data);
  return res.data.data as Customer;
};

export const deleteCustomer = async (id: string) => {
  const res = await apiClient.delete(`/customers/${id}`);
  return res.data;
};

export const addFollowUp = async (customerId: string, note: string) => {
  const res = await apiClient.post(
    `/customers/${customerId}/follow-ups`,
    { note }
  );
  return res.data.data as FollowUp;
};

export const getFollowUps = async (customerId: string) => {
  const res = await apiClient.get(`/customers/${customerId}/follow-ups`);
  return res.data.data as FollowUp[];
};