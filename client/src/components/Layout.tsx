import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  CreditCard,
  BarChart2,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const links = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Units", icon: Building2, path: "/units" },
    { label: "Tenants", icon: Users, path: "/tenants" },
    { label: "Payments", icon: CreditCard, path: "/payments" },
    { label: "Reports", icon: BarChart2, path: "/reports" },
    { label: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A1A2F] text-white">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "relative h-full border-r border-white/10 bg-[#10233F] transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-20 flex h-7 w-7 items-center justify-center 
            rounded-full border border-white/20 bg-[#0A1A2F] text-white shadow-md hover:bg-[#132B4F]"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand */}
        <div className="p-4">
          <h1
            className={cn(
              "font-bold text-xl tracking-wide whitespace-nowrap transition-opacity",
              collapsed && "opacity-0"
            )}
          >
            The Residence
          </h1>

          {/* TAGLINE */}
          <p
            className={cn(
              "text-xs text-white/70 mt-1 transition-opacity",
              collapsed && "opacity-0"
            )}
          >
            Property Management Suite
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2 mt-2">
          {links.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/10",
                  isActive ? "bg-white/10 text-primary" : "text-white/70"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "transition-opacity whitespace-nowrap",
                  collapsed && "opacity-0 w-0 overflow-hidden"
                )}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto p-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm 
              text-white/70 hover:text-white hover:bg-white/10 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span
              className={cn(
                "transition-opacity",
                collapsed && "opacity-0 w-0 overflow-hidden"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT + FOOTER */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
