import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import DataTable from "../components/DataTable";
import PaginationControls from "../components/PaginationControls";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import ProductForm from "../components/ProductForm";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

import type { Product, ProductFormData } from "../types/product";
import type { Pagination } from "../types/common";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const [products, setProducts] = useState<Product[]>([]);
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProducts(search, page);
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      setToast({ message: "Failed to load products", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      setToast({ message: "Product updated", type: "success" });
    } else {
      await createProduct(data);
      setToast({ message: "Product created", type: "success" });
    }
    setModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      setToast({ message: "Product deleted", type: "success" });
      fetchProducts();
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
        <h1 className="text-2xl font-bold">Products</h1>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        )}
      </div>

      <div className="mb-4">
        <SearchBar
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name or SKU..."
        />
      </div>

      <DataTable
        data={products}
        loading={loading}
        keyExtractor={(p) => p.id}
        columns={[
          {
            header: "Name",
            accessor: (p) => (
              <Link
                to={`/products/${p.id}`}
                className="text-blue-600 hover:underline"
              >
                {p.name}
              </Link>
            ),
          },
          { header: "SKU", accessor: (p) => p.sku },
          { header: "Category", accessor: (p) => p.category || "-" },
          { header: "Price", accessor: (p) => `₹${p.price}` },
          {
            header: "Stock",
            accessor: (p) => {
              const low =
                p.minStockAlert != null && p.stock <= p.minStockAlert;
              return (
                <span
                  className={
                    low ? "text-red-600 font-semibold" : "text-gray-800"
                  }
                >
                  {p.stock} {low && "⚠️"}
                </span>
              );
            },
          },
          { header: "Location", accessor: (p) => p.location || "-" },
          {
            header: "Actions",
            accessor: (p) => (
              <div className="flex gap-3">
                {canEdit && (
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                )}
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => handleDelete(p.id)}
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
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <ProductForm
          initialData={editingProduct || undefined}
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