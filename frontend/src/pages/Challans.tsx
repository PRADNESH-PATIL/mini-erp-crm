import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import DataTable from "../components/DataTable";
import PaginationControls from "../components/PaginationControls";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import ChallanForm from "../components/ChallanForm";
import { useAuth } from "../context/AuthContext";

import { getChallans, createChallan } from "../api/challans";

import type { Challan, ChallanFormData } from "../types/challan";
import type { Pagination } from "../types/common";

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canManageChallans = user?.role === "ADMIN" || user?.role === "SALES";


  const [modalOpen, setModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getChallans(search, status, page);
      setChallans(result.challans);
      setPagination(result.pagination);
    } catch (err) {
      setToast({ message: "Failed to load challans", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const handleCreate = async (data: ChallanFormData) => {
    await createChallan(data);
    setToast({ message: "Draft challan created", type: "success" });
    setModalOpen(false);
    fetchChallans();
  };

  const statusColor = (s: string) => {
    if (s === "CONFIRMED") return "bg-green-100 text-green-700";
    if (s === "CANCELLED") return "bg-gray-200 text-gray-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Sales Challans</h1>
        {canManageChallans && (
  <button
    onClick={() => setModalOpen(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    + Create Challan
  </button>
)}
      </div>

      <div className="flex gap-3 mb-4">
        <SearchBar
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by challan number or customer..."
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable
        data={challans}
        loading={loading}
        keyExtractor={(c) => c.id}
        columns={[
          {
            header: "Challan #",
            accessor: (c) => (
              <Link
                to={`/challans/${c.id}`}
                className="text-blue-600 hover:underline"
              >
                {c.challanNumber}
              </Link>
            ),
          },
          { header: "Customer", accessor: (c) => c.customer.name },
          { header: "Qty", accessor: (c) => c.totalQuantity },
          { header: "Amount", accessor: (c) => `₹${c.totalAmount}` },
          {
            header: "Status",
            accessor: (c) => (
              <span
                className={`px-2 py-1 rounded text-xs ${statusColor(c.status)}`}
              >
                {c.status}
              </span>
            ),
          },
          {
            header: "Created",
            accessor: (c) => new Date(c.createdAt).toLocaleDateString(),
          },
        ]}
      />

      <PaginationControls pagination={pagination} onPageChange={setPage} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Draft Challan"
      >
        <ChallanForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
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