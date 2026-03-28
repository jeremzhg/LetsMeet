import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";

  export const App = () => {
    return (
      <BrowserRouter>
        <Routes>
          {/* Default Route, otomatis lempar ke login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Halaman utama setelah berhasil masuk */}
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    );
  };
