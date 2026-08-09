import { useState, useEffect } from "react";
import apiClient from "../api/client";

interface CustomerOption {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (customerId: string) => void;
}

export default function CustomerSelect({ value, onChange }: Props) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await apiClient.get("/customers", {
          params: { page: 1, limit: 100 },
        });
        setCustomers(res.data.data.customers);
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
      <option value="">-- Select Customer --</option>
      {customers.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}