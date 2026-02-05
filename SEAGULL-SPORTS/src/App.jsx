import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PartyManagement from "./pages/admin/party/views/PartyManagement";
import PartyAddScreen from "./pages/admin/party/views/PartyAddScreen";
import ItemManagement from "./pages/admin/item/views/ItemManagement";
import ItemAddScreen from "./pages/admin/item/views/ItemAddScreen";
import InvoiceManagement from "./pages/admin/invoice/views/InvoiceManagement";
import InvoiceAddScreen from "./pages/admin/invoice/views/InvoiceAddScreen";
import PurchaseManagement from "./pages/admin/purchase/views/PurchaseManagement";
import PurchaseAddScreen from "./pages/admin/purchase/views/PurchaseAddScreen";
import PaymentManagement from "./pages/admin/payment/views/PaymentManagement";
import PaymentAddScreen from "./pages/admin/payment/views/PaymentAddScreen";
import OrderManagement from "./pages/admin/order/views/OrderManagement";
import OrderViewScreen from "./pages/admin/order/views/OrderViewScreen";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Add other role redirects here
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="parties" element={<PartyManagement />} />
                <Route path="parties/add" element={<PartyAddScreen />} />
                <Route path="parties/edit/:id" element={<PartyAddScreen />} />
                <Route path="items" element={<ItemManagement />} />
                <Route path="items/add" element={<ItemAddScreen />} />
                <Route path="items/edit/:id" element={<ItemAddScreen />} />
                <Route path="invoices" element={<InvoiceManagement />} />
                <Route path="invoices/add" element={<InvoiceAddScreen />} />
                <Route
                  path="invoices/edit/:id"
                  element={<InvoiceAddScreen />}
                />
                <Route path="purchases" element={<PurchaseManagement />} />
                <Route path="purchases/add" element={<PurchaseAddScreen />} />
                <Route
                  path="purchases/edit/:id"
                  element={<PurchaseAddScreen />}
                />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="payments/add" element={<PaymentAddScreen />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="orders/:orderId" element={<OrderViewScreen />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
