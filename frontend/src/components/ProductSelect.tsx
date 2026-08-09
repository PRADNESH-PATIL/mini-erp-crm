import { useState, useEffect } from "react";
import apiClient from "../api/client";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface Props {
  value: string;
  onChange: (productId: string) => void;
}

export default function ProductSelect({ value, onChange }: Props) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await apiClient.get("/products", {
          params: { page: 1, limit: 100 },
        });
        setProducts(res.data.data.products);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full border rounded px-3 py-2"
      disabled={loading}
    >
      <option value="">-- Select Product --</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} ({p.sku}) — ₹{p.price} — Stock: {p.stock}
        </option>
      ))}
    </select>
  );
}