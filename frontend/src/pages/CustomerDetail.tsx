import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import { getCustomerById, addFollowUp } from "../api/customers";
import type { Customer, FollowUp } from "../types/customer";
import { useAuth } from "../context/AuthContext";

import Toast from "../components/Toast";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<(Customer & { followUps: FollowUp[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "SALES";

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getCustomerById(id);
      setCustomer(data);
    } catch (err) {
      setToast({ message: "Failed to load customer", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleAddNote = async () => {
    if (!id || !note.trim()) return;

    setSubmitting(true);
    try {
      await addFollowUp(id, note.trim());
      setNote("");
      setToast({ message: "Follow-up added", type: "success" });
      fetchCustomer();
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Failed to add note",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!customer) return <div className="p-6">Customer not found</div>;

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/customers" className="text-blue-600 hover:underline text-sm">
        &larr; Back to Customers
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">{customer.name}</h1>

      <div className="bg-white border rounded p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Phone</span>
          <div>{customer.phone || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Email</span>
          <div>{customer.email || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Business Name</span>
          <div>{customer.businessName || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">GST Number</span>
          <div>{customer.gstNumber || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Customer Type</span>
          <div>{customer.customerType || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Status</span>
          <div>{customer.status}</div>
        </div>
        <div>
          <span className="text-gray-500">Address</span>
          <div>{customer.address || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Follow-up Date</span>
          <div>
            {customer.followUpDate
              ? new Date(customer.followUpDate).toLocaleDateString()
              : "-"}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Follow-up Notes</h2>

      {canEdit && (
        <div className="flex gap-2 mb-4">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a follow-up note..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleAddNote}
            disabled={submitting || !note.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-3">
        {customer.followUps.length === 0 && (
          <div className="text-gray-500 text-sm">No follow-up notes yet.</div>
        )}
        {customer.followUps.map((f: FollowUp) => (
          <div key={f.id} className="border rounded p-3 text-sm">
            <div>{f.note}</div>
            <div className="text-gray-400 text-xs mt-1">
              {new Date(f.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

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