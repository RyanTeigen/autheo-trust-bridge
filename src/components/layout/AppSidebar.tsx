
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  Heart,
  Users,
  Shield,
  FileSearch,
  Settings,
  Rocket
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { open, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-64 flex-col overflow-y-auto border-r border-r-slate-800 bg-slate-900 px-3 py-4 transition-transform duration-200 ease-in-out dark:bg-slate-900",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <nav className="flex flex-col flex-1 gap-2">
        {navigation.map((item) => (
          <NavItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            url={item.url}
            description={item.description}
            onClick={() => toggleSidebar()}
          />
        ))}
      </nav>
    </aside>
  );
};

interface NavItemProps {
  title: string;
  icon: React.ReactNode;
  url: string;
  description: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ title, icon, url, description, onClick }) => {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        cn(
          "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
          isActive
            ? "bg-slate-800 text-slate-100"
            : "text-slate-400"
        )
      }
      onClick={onClick}
    >
      {icon}
      <div className="flex flex-col">
        <span>{title}</span>
        <span className="text-xs text-slate-500 group-hover:text-slate-400">{description}</span>
      </div>
    </NavLink>
  );
};

const navigation = [
  {
    title: "My Health",
    icon: <Heart className="h-4 w-4" />,
    url: "/",
    description: "Personal health dashboard"
  },
  {
    title: "Provider Portal",
    icon: <Users className="h-4 w-4" />,
    url: "/provider-portal",
    description: "Healthcare provider interface"
  },
  {
    title: "Compliance",
    icon: <Shield className="h-4 w-4" />,
    url: "/compliance",
    description: "Regulatory compliance"
  },
  {
    title: "Audit Logs",
    icon: <FileSearch className="h-4 w-4" />,
    url: "/audit-logs",
    description: "Security and access logs"
  },
  {
    title: "Production Deploy",
    icon: <Rocket className="h-4 w-4" />,
    url: "/production-deployment",
    description: "Production deployment management"
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    url: "/settings",
    description: "Application preferences"
  }
];

export default AppSidebar;
