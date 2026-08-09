import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

import { getProductById, addStockMovement, getStockMovements } from "../api/products";
import type { Product, StockMovement } from "../types/product";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const canAdjustStock = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [productData, movementData] = await Promise.all([
        getProductById(id),
        getStockMovements(id),
      ]);
      setProduct(productData);
      setMovements(movementData);
    } catch (err) {
      setToast({ message: "Failed to load product", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStockSubmit = async () => {
    if (!id || !quantity || Number(quantity) <= 0) return;

    setSubmitting(true);
    try {
      await addStockMovement(id, type, Number(quantity), reason || undefined);
      setToast({ message: "Stock updated successfully", type: "success" });
      setQuantity("");
      setReason("");
      fetchData();
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Failed to update stock",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/products" className="text-blue-600 hover:underline text-sm">
        &larr; Back to Products
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-6">{product.name}</h1>

      <div className="bg-white border rounded p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">SKU</span>
          <div>{product.sku}</div>
        </div>
        <div>
          <span className="text-gray-500">Category</span>
          <div>{product.category || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Price</span>
          <div>₹{product.price}</div>
        </div>
        <div>
          <span className="text-gray-500">Current Stock</span>
          <div className="text-lg font-semibold">{product.stock}</div>
        </div>
        <div>
          <span className="text-gray-500">Min Stock Alert</span>
          <div>{product.minStockAlert ?? "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Location</span>
          <div>{product.location || "-"}</div>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Description</span>
          <div>{product.description || "-"}</div>
        </div>
      </div>

      {canAdjustStock && (
        <>
          <h2 className="text-lg font-semibold mb-3">Adjust Stock</h2>

          <div className="bg-gray-50 border rounded p-4 mb-6 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "IN" | "OUT")}
                className="border rounded px-3 py-2"
              >
                <option value="IN">IN (Add stock)</option>
                <option value="OUT">OUT (Remove stock)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border rounded px-3 py-2 w-28"
                min={1}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Stock purchase"
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <button
              onClick={handleStockSubmit}
              disabled={submitting || !quantity}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold mb-3">Movement History</h2>

      <div className="space-y-2">
        {movements.length === 0 && (
          <div className="text-gray-500 text-sm">No movements yet.</div>
        )}
        {movements.map((m) => (
          <div
            key={m.id}
            className="border rounded p-3 text-sm flex justify-between items-center"
          >
            <div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                  m.type === "IN"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {m.type}
              </span>
              <span className="font-medium">{m.quantity}</span> units
              {m.reason && <span className="text-gray-500"> — {m.reason}</span>}
            </div>
            <div className="text-gray-400 text-xs text-right">
              <div>{m.createdBy.name}</div>
              <div>{new Date(m.createdAt).toLocaleString()}</div>
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