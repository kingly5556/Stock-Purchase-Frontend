import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { NewPurchaseOrderPage } from "./pages/NewPurchaseOrderPage";
import { ProductsPage } from "./pages/ProductsPage";
import { PurchaseOrderDetailPage } from "./pages/PurchaseOrderDetailPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { StockCardPage } from "./pages/StockCardPage";
import { SuppliersPage } from "./pages/SuppliersPage";

// "/" in dev, "/erp/stock" in production — must match vite.config.ts's
// `base` so client-side routes line up with the prefix ERPHUB's proxy uses.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId/stock-card" element={<StockCardPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="purchase-orders/new" element={<NewPurchaseOrderPage />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
