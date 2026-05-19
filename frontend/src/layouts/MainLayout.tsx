import {
  BarChart3,
  BookOpen,
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  UserRound,
  Users,
  type LucideIcon
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandLogo } from "../components/BrandLogo";

type NavigationItem = {
  adminOnly?: boolean;
  children?: NavigationItem[];
  icon: LucideIcon;
  label: string;
  path: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Inicio",
    path: "/",
    icon: LayoutDashboard
  },
  {
    label: "Administracion de usuarios",
    path: "/administracion-usuarios",
    icon: Users,
    adminOnly: true
  },
  {
    label: "Catalogos",
    path: "/catalogos",
    icon: BookOpen,
    adminOnly: true,
    children: [
      {
        label: "Empresas",
        path: "/catalogos/empresas",
        icon: Building2
      }
    ]
  },
  {
    label: "Mi perfil",
    path: "/mi-perfil",
    icon: UserRound
  },
  {
    label: "Informes",
    path: "/informes",
    icon: FileText,
    children: [
      {
        label: "Ventas",
        path: "/informes/ventas",
        icon: DollarSign
      },
      {
        label: "Creditos",
        path: "/informes/creditos",
        icon: CreditCard
      },
      {
        label: "Arrendamientos",
        path: "/informes/arrendamientos",
        icon: FileText
      },
      {
        label: "Cargas realizadas",
        path: "/informes/cargas",
        icon: History
      }
    ]
  },
  {
    label: "Reportes",
    path: "/reportes",
    icon: BarChart3,
    adminOnly: true
  }
];

export function MainLayout({ children }: { children: ReactNode }) {
  const { logout, session } = useAuth();
  const isAdmin = session?.user.role === "admin";
  const visibleNavigationItems = navigationItems
    .filter((item) => isAdmin || !item.adminOnly)
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => isAdmin || !child.adminOnly)
    }));

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <BrandLogo compact />
          <span className="sidebar-kicker">Sistema PLD</span>
        </div>

        <nav className="sidebar-nav" aria-label="Menu principal">
          {visibleNavigationItems.map(({ children, icon: Icon, label, path }) => {
            if (children) {
              return (
                <div className="sidebar-group" key={path}>
                  <div className="sidebar-group-label">
                    <Icon aria-hidden="true" size={18} strokeWidth={2} />
                    <span>{label}</span>
                  </div>
                  <div className="sidebar-subnav">
                    {children.map(({ icon: ChildIcon, label: childLabel, path: childPath }) => (
                      <NavLink
                        className={({ isActive }) =>
                          isActive
                            ? "sidebar-link sidebar-sublink sidebar-link-active"
                            : "sidebar-link sidebar-sublink"
                        }
                        key={childPath}
                        to={childPath}
                      >
                        <ChildIcon aria-hidden="true" size={16} strokeWidth={2} />
                        <span>{childLabel}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                className={({ isActive }) =>
                  isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
                }
                end={path === "/"}
                key={path}
                to={path}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-label">Sesion activa</span>
            <strong>{session?.user.email}</strong>
          </div>
          <button className="logout-button" type="button" onClick={logout}>
            <LogOut aria-hidden="true" size={18} strokeWidth={2} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <section className="content-shell">
        <header className="content-header">
          <div>
            <p className="eyebrow">Portal PLD Grupo Autocom</p>
            <h1>Panel corporativo de cumplimiento</h1>
          </div>
          <div className="header-user">
            <span>{session?.user.role}</span>
            <strong>{session?.user.email}</strong>
          </div>
        </header>

        <main className="content-main">{children}</main>
      </section>
    </div>
  );
}
