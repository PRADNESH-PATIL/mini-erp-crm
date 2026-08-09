import apiClient from "./client";
import type { Challan, ChallanFormData } from "../types/challan";
import type { Pagination } from "../types/common";

export const getChallans = async (
  search: string,
  status: string,
  page: number,
  limit = 10
) => {
  const res = await apiClient.get("/challans", {
    params: { search, status: status || undefined, page, limit },
  });

  return res.data.data as {
    challans: Challan[];
    pagination: Pagination;
  };
};

export const getChallanById = async (id: string) => {
  const res = await apiClient.get(`/challans/${id}`);
  return res.data.data as Challan;
};

export const createChallan = async (data: ChallanFormData) => {
  const res = await apiClient.post("/challans", data);
  return res.data.data as Challan;
};

export const updateChallan = async (id: string, data: ChallanFormData) => {
  const res = await apiClient.patch(`/challans/${id}`, data);
  return res.data.data as Challan;
};

export const confirmChallan = async (id: string) => {
  const res = await apiClient.post(`/challans/${id}/confirm`);
  return res.data.data as Challan;
};

export const cancelChallan = async (id: string) => {
  const res = await apiClient.post(`/challans/${id}/cancel`);
  return res.data.data as Challan;
};