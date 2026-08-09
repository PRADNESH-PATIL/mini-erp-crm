import { useState } from "react";
import type { FormEvent } from "react";
import CustomerSelect from "./CustomerSelect";
import ProductSelect from "./ProductSelect";
import type { Challan, ChallanFormData, ChallanFormItem } from "../types/challan";

interface Props {
  initialData?: Challan;
  onSubmit: (data: ChallanFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ChallanForm({ initialData, onSubmit, onCancel }: Props) {
  const [customerId, setCustomerId] = useState(initialData?.customerId || "");

  const [items, setItems] = useState<ChallanFormItem[]>(
    initialData
      ? initialData.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        }))
      : [{ productId: "", quantity: 1 }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addRow = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const removeRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateRow = (
    index: number,
    field: "productId" | "quantity",
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer");
      return;
    }

    const validItems = items.filter(
      (i) => i.productId && i.quantity > 0
    );

    if (validItems.length === 0) {
      setError("Add at least one product with quantity greater than 0");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ customerId, items: validItems });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-2 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Customer *</label>
        <CustomerSelect value={customerId} onChange={setCustomerId} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Products *</label>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <ProductSelect
                  value={item.productId}
                  onChange={(val) => updateRow(index, "productId", val)}
                />
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateRow(index, "quantity", Number(e.target.value))
                }
                className="w-24 border rounded px-3 py-2"
                placeholder="Qty"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-600 px-2 py-2 hover:bg-red-50 rounded"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          + Add another product
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>
      </div>
    </form>
  );
}