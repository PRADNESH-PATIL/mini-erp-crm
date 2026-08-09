import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    draftChallans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, productsRes, challansRes] = await Promise.allSettled([
          apiClient.get("/customers", { params: { page: 1, limit: 1 } }),
          apiClient.get("/products", { params: { page: 1, limit: 100 } }),
          apiClient.get("/challans", {
            params: { status: "DRAFT", page: 1, limit: 1 },
          }),
        ]);

        const customersTotal =
          customersRes.status === "fulfilled"
            ? customersRes.value.data.data.pagination.total
            : 0;

        const products =
          productsRes.status === "fulfilled"
            ? productsRes.value.data.data.products
            : [];

        const productsTotal =
          productsRes.status === "fulfilled"
            ? productsRes.value.data.data.pagination.total
            : 0;

        const lowStock = products.filter(
          (p: any) => p.minStockAlert != null && p.stock <= p.minStockAlert
        ).length;

        const draftChallansTotal =
          challansRes.status === "fulfilled"
            ? challansRes.value.data.data.pagination.total
            : 0;

        setStats({
          customers: customersTotal,
          products: productsTotal,
          lowStock,
          draftChallans: draftChallansTotal,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: "Total Customers", value: stats.customers, link: "/customers", color: "bg-blue-50 text-blue-700" },
    { label: "Total Products", value: stats.products, link: "/products", color: "bg-purple-50 text-purple-700" },
    { label: "Low Stock Alerts", value: stats.lowStock, link: "/products", color: "bg-red-50 text-red-700" },
    { label: "Draft Challans", value: stats.draftChallans, link: "/challans", color: "bg-yellow-50 text-yellow-700" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {user?.name}
      </h1>
      <p className="text-gray-500 mb-6">
        Role: {user?.role}
      </p>

      {loading ? (
        <div className="text-gray-500">Loading dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className={`rounded-lg p-6 ${card.color} hover:opacity-80 transition`}
            >
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm mt-1">{card.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          to="/customers"
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Manage Customers
        </Link>
        <Link
          to="/products"
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Manage Products
        </Link>
        <Link
          to="/challans"
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Manage Challans
        </Link>
      </div>
    </div>
  );
}