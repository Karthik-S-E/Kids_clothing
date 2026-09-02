import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { ShopPage } from "./pages/ShopPage";
import { useProductStore } from "./store/productStore";
import { useThemeStore } from "./store/themeStore";

export default function App() {
  const hydrate = useProductStore((s) => s.hydrate);
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    setTheme(theme);
    void hydrate();
  }, [hydrate, setTheme, theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
