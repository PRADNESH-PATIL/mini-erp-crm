import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import DataTable from "../components/DataTable";
import PaginationControls from "../components/PaginationControls";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import CustomerForm from "../components/CustomerForm";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customers";

import type { Customer, CustomerFormData } from "../types/customer";
import type { Pagination } from "../types/common";
import { useAuth } from "../context/AuthContext";

export default function Customers() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "SALES";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    null
  );

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCustomers(search, page);
      setCustomers(result.customers);
      setPagination(result.pagination);
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        status === 403
          ? "You don't have access to view customers"
          : "Failed to load customers";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: CustomerFormData) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data);
      setToast({ message: "Customer updated", type: "success" });
    } else {
      await createCustomer(data);
      setToast({ message: "Customer created", type: "success" });
    }
    setModalOpen(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;

    try {
      await deleteCustomer(id);
      setToast({ message: "Customer deleted", type: "success" });
      fetchCustomers();
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Delete failed",
        type: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Customer
          </button>
        )}
      </div>

      <div className="mb-4">
        <SearchBar
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name, email, phone..."
        />
      </div>

      <DataTable
        data={customers}
        loading={loading}
        keyExtractor={(c) => c.id}
        columns={[
          {
            header: "Name",
            accessor: (c) => (
              <Link
                to={`/customers/${c.id}`}
                className="text-blue-600 hover:underline"
              >
                {c.name}
              </Link>
            ),
          },
          { header: "Phone", accessor: (c) => c.phone || "-" },
          { header: "Email", accessor: (c) => c.email || "-" },
          { header: "Type", accessor: (c) => c.customerType || "-" },
          {
            header: "Status",
            accessor: (c) => (
              <span
                className={`px-2 py-1 rounded text-xs ${c.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : c.status === "LEAD"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {c.status}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: (c) => (
              <div className="flex gap-3">
                {canEdit && (
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                )}
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />

      <PaginationControls pagination={pagination} onPageChange={setPage} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
      >
        <CustomerForm
          initialData={editingCustomer || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setModalOpen(false)}
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