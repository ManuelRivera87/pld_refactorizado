import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
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
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
    label: "Mi perfil",
    path: "/mi-perfil",
    icon: UserRound
  },
  {
    label: "Inicio",
    path: "/",
    icon: LayoutDashboard
  },
  {
    label: "Catalogos",
    path: "/catalogos",
    icon: BookOpen,
    adminOnly: true,
    children: [
      {
        label: "Gestion de usuarios",
        path: "/administracion-usuarios",
        icon: Users
      },
      {
        label: "Empresas",
        path: "/catalogos/empresas",
        icon: Building2
      }
    ]
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
      }
    ]
  },
  {
    label: "Consultas y reportes",
    path: "/reportes",
    icon: BarChart3,
    children: [
      {
        label: "Cargas realizadas",
        path: "/informes/cargas",
        icon: History
      }
    ]
  }
];

export function MainLayout({ children }: { children: ReactNode }) {
  const { logout, session } = useAuth();
  const location = useLocation();
  const isAdmin = session?.user.role === "admin";
  const visibleNavigationItems = useMemo(
    () =>
      navigationItems
        .filter((item) => isAdmin || !item.adminOnly)
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => isAdmin || !child.adminOnly)
        })),
    [isAdmin]
  );
  const defaultOpenGroups = useMemo(
    () =>
      visibleNavigationItems.reduce<Record<string, boolean>>((accumulator, item) => {
        if (item.children?.length) {
          accumulator[item.path] = item.children.some((child) =>
            location.pathname.startsWith(child.path)
          );
        }

        return accumulator;
      }, {}),
    [location.pathname, visibleNavigationItems]
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(defaultOpenGroups);

  useEffect(() => {
    setOpenGroups((current) => {
      const nextState = { ...current };
      let hasChanges = false;

      Object.entries(defaultOpenGroups).forEach(([path, isOpenByRoute]) => {
        if (isOpenByRoute && !nextState[path]) {
          nextState[path] = true;
          hasChanges = true;
        } else if (!(path in nextState)) {
          nextState[path] = false;
          hasChanges = true;
        }
      });

      return hasChanges ? nextState : current;
    });
  }, [defaultOpenGroups]);

  const toggleGroup = (path: string) => {
    setOpenGroups((current) => ({
      ...current,
      [path]: !current[path]
    }));
  };

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
              const isGroupOpen = openGroups[path] ?? false;
              const isGroupActive = children.some((child) =>
                location.pathname.startsWith(child.path)
              );

              return (
                <div
                  className={
                    isGroupActive ? "sidebar-group sidebar-group-active" : "sidebar-group"
                  }
                  key={path}
                >
                  <button
                    aria-expanded={isGroupOpen}
                    className="sidebar-group-toggle"
                    type="button"
                    onClick={() => toggleGroup(path)}
                  >
                    <span className="sidebar-group-label">
                      <Icon aria-hidden="true" size={18} strokeWidth={2} />
                      <span>{label}</span>
                    </span>
                    {isGroupOpen ? (
                      <ChevronDown aria-hidden="true" size={16} strokeWidth={2.2} />
                    ) : (
                      <ChevronRight aria-hidden="true" size={16} strokeWidth={2.2} />
                    )}
                  </button>
                  <div
                    className={
                      isGroupOpen
                        ? "sidebar-subnav sidebar-subnav-open"
                        : "sidebar-subnav"
                    }
                  >
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
