import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Building2, Users, CreditCard, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1a2f]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 text-white">{children}</main>
    </div>
  );
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Units", icon: Building2, path: "/units" },
    { name: "Tenants", icon: Users, path: "/tenants" },
    { name: "Payments", icon: CreditCard, path: "/payments" },
    { name: "Reports", icon: BarChart2, path: "/reports" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "relative h-full border-r border-white/10 bg-[#10233f] text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#0a1a2f] text-white shadow-sm hover:bg-[#132b4f]"
      >
        <span className="text-xs">{collapsed ? ">" : "<"}</span>
      </button>

      <div className="flex flex-col gap-2 p-4">
        <h1
          className={cn(
            "font-bold text-xl transition-opacity",
            collapsed && "opacity-0"
          )}
        >
          The Residence
        </h1>

        {/* Tagline */}
        <p
  className={cn(
    "text-xs text-white/80 mt-1 transition-opacity",
    collapsed && "opacity-0"
  )}
>
  Property Management Suite
</p>


        <nav className="flex flex-col gap-1 pt-4">
          {links.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-white/10",
                  isActive && "bg-white/10 text-primary"
                )
              }
            >
              <Icon className="mr-3 h-5 w-5" />
              <span
                className={cn(
                  "transition-opacity",
                  collapsed && "opacity-0 w-0 overflow-hidden"
                )}
              >
                {name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
