import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getChallanById,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from "../api/challans";
import type { Challan, ChallanFormData } from "../types/challan";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import ChallanForm from "../components/ChallanForm";
import { useAuth } from "../context/AuthContext";

export default function ChallanDetail() {
  const { id } = useParams<{ id: string }>();

  const { user } = useAuth();
  const canManageChallans = user?.role === "ADMIN" || user?.role === "SALES";

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchChallan = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setAccessDenied(false);
    try {
      const data = await getChallanById(id);
      setChallan(data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setAccessDenied(true);
      } else {
        setToast({ message: "Failed to load challan", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallan();
  }, [fetchChallan]);

  const handleEditSubmit = async (data: ChallanFormData) => {
    if (!id) return;
    await updateChallan(id, data);
    setToast({ message: "Challan updated", type: "success" });
    setEditModalOpen(false);
    fetchChallan();
  };

  const handleConfirm = async () => {
    if (!id) return;
    if (!confirm("Confirm this challan? Stock will be deducted.")) return;

    setActionLoading(true);
    try {
      await confirmChallan(id);
      setToast({ message: "Challan confirmed successfully", type: "success" });
      fetchChallan();
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Failed to confirm",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm("Cancel this challan?")) return;

    setActionLoading(true);
    try {
      await cancelChallan(id);
      setToast({ message: "Challan cancelled", type: "success" });
      fetchChallan();
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Failed to cancel",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (accessDenied)
    return (
      <div className="p-6 text-red-600">
        You don't have permission to view this challan.
      </div>
    );
  if (!challan) return <div className="p-6">Challan not found</div>;

  const isDraft = challan.status === "DRAFT";

  const statusColor =
    challan.status === "CONFIRMED"
      ? "bg-green-100 text-green-700"
      : challan.status === "CANCELLED"
      ? "bg-gray-200 text-gray-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/challans" className="text-blue-600 hover:underline text-sm">
        &larr; Back to Challans
      </Link>

      <div className="flex items-center justify-between mt-2 mb-6">
        <h1 className="text-2xl font-bold">{challan.challanNumber}</h1>
        <span className={`px-3 py-1 rounded text-sm font-semibold ${statusColor}`}>
          {challan.status}
        </span>
      </div>

      <div className="bg-white border rounded p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Customer</span>
          <div>{challan.customer.name}</div>
        </div>
        <div>
          <span className="text-gray-500">Phone</span>
          <div>{challan.customer.phone || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Total Quantity</span>
          <div>{challan.totalQuantity}</div>
        </div>
        <div>
          <span className="text-gray-500">Total Amount</span>
          <div className="text-lg font-semibold">₹{challan.totalAmount}</div>
        </div>
        <div>
          <span className="text-gray-500">Created By</span>
          <div>{challan.createdBy?.name || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Created Date</span>
          <div>{new Date(challan.createdAt).toLocaleString()}</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Items</h2>

      <div className="overflow-x-auto border rounded mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Product
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                SKU
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Qty
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {challan.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-sm">{item.productName}</td>
                <td className="px-4 py-2 text-sm">{item.sku}</td>
                <td className="px-4 py-2 text-sm">₹{item.price}</td>
                <td className="px-4 py-2 text-sm">{item.quantity}</td>
                <td className="px-4 py-2 text-sm">₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDraft && canManageChallans && (
        <div className="flex gap-3">
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Edit Draft
          </button>
          <button
            onClick={handleConfirm}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Confirm Challan"}
          </button>
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Cancel Challan"}
          </button>
        </div>
      )}

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Draft Challan"
      >
        <ChallanForm
          initialData={challan}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditModalOpen(false)}
        />
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}