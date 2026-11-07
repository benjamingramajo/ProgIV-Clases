import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { AuthProvider } from "./Auth";
import { AuthLayout } from "./AuthLayout";
import { Layout } from "./Layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Productos } from "./Productos";
import { ProductoDetalles } from "./ProductoDetalles";
import { ProductoCrear } from "./ProductoCrear";
import { Usuarios } from "./Usuarios";
import { UsuarioDetalles } from "./UsuariosDetalles";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />

            <Route element={<AuthLayout />}>
              <Route path="productos">
                <Route index element={<Productos />} />
                <Route path=":id" element={<ProductoDetalles />} />
                <Route path="crear" element={<ProductoCrear />} />
              </Route>
            </Route>

            <Route element={<AuthLayout soloAdmin />}>
              <Route path="usuarios">
                <Route index element={<Usuarios />} />
                <Route path=":id" element={<UsuarioDetalles />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
