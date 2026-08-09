import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Challans from "./pages/Challans";
import CustomerDetail from "./pages/CustomerDetail";
import ProductDetail from "./pages/ProductDetail";
import ChallanDetail from "./pages/ChallanDetail";



function NavBar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900 text-white">
      <div className="flex gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/products">Products</Link>
        <Link to="/challans">Challans</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {user.name} ({user.role})
        </span>
        <button
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challans/:id"
        element={
          <ProtectedRoute>
            <ChallanDetail />
          </ProtectedRoute>
        }
      />


      <Route
        path="/challans"
        element={
          <ProtectedRoute>
            <Challans />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;