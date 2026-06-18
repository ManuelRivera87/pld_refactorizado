import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { MainLayout } from "../layouts/MainLayout";
import { CompanyCatalogPage } from "../pages/CompanyCatalogPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ReportUploadPage } from "../pages/ReportUploadPage";
import { ReportUploadsPage } from "../pages/ReportUploadsPage";
import { UserAdministrationPage } from "../pages/UserAdministrationPage";

const protectedRoutes = [
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/administracion-usuarios",
    element: <UserAdministrationPage />,
    allowedRoles: ["admin"]
  },
  {
    path: "/catalogos",
    element: <Navigate to="/catalogos/empresas" replace />,
    allowedRoles: ["admin"]
  },
  {
    path: "/catalogos/empresas",
    element: <CompanyCatalogPage />,
    allowedRoles: ["admin"]
  },
  {
    path: "/mi-perfil",
    element: <ProfilePage />
  },
  {
    path: "/informes",
    element: <Navigate to="/informes/ventas" replace />
  },
  {
    path: "/informes/ventas",
    element: <ReportUploadPage key="ventas" kind="ventas" />
  },
  {
    path: "/informes/creditos",
    element: <ReportUploadPage key="creditos" kind="creditos" />
  },
  {
    path: "/informes/arrendamientos",
    element: <ReportUploadPage key="arrendamientos" kind="arrendamientos" />
  },
  {
    path: "/informes/cargas",
    element: <ReportUploadsPage />
  },
  {
    path: "/reportes",
    element: <PlaceholderPage eyebrow="Reporteria" title="Reportes" />,
    allowedRoles: ["admin"]
  }
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {protectedRoutes.map((route) => (
        <Route
          element={
            <ProtectedRoute allowedRoles={route.allowedRoles}>
              <MainLayout>{route.element}</MainLayout>
            </ProtectedRoute>
          }
          key={route.path}
          path={route.path}
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
