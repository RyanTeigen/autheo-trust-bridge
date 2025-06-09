
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
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useState } from 'react';

const AppSidebar: React.FC = () => {
  const { open, toggleSidebar } = useSidebar();
  const [complianceOpen, setComplianceOpen] = useState(false);

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
                        isActive
                          ? "bg-slate-800 text-slate-100"
                          : "text-slate-400"
                      )
                    }
                    onClick={() => toggleSidebar()}
                  >
                    <Heart className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>My Health</span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-400">Personal health dashboard</span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/provider-portal"
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
                        isActive
                          ? "bg-slate-800 text-slate-100"
                          : "text-slate-400"
                      )
                    }
                    onClick={() => toggleSidebar()}
                  >
                    <Users className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Provider Portal</span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-400">Healthcare provider interface</span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Compliance with nested Audit Logs */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setComplianceOpen(!complianceOpen)}
                  className="group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200 text-slate-400 cursor-pointer"
                >
                  <Shield className="h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span>Compliance</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">Regulatory compliance</span>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 transition-transform", complianceOpen && "rotate-90")} />
                </SidebarMenuButton>
                {complianceOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink
                          to="/compliance"
                          className={({ isActive }) =>
                            cn(
                              "flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
                              isActive
                                ? "bg-slate-800 text-slate-100"
                                : "text-slate-400"
                            )
                          }
                          onClick={() => toggleSidebar()}
                        >
                          <span>Overview</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink
                          to="/audit-logs"
                          className={({ isActive }) =>
                            cn(
                              "flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
                              isActive
                                ? "bg-slate-800 text-slate-100"
                                : "text-slate-400"
                            )
                          }
                          onClick={() => toggleSidebar()}
                        >
                          <FileSearch className="h-4 w-4" />
                          <span>Audit Logs</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-slate-100 transition-colors duration-200",
                        isActive
                          ? "bg-slate-800 text-slate-100"
                          : "text-slate-400"
                      )
                    }
                    onClick={() => toggleSidebar()}
                  >
                    <Settings className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Settings</span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-400">Application preferences</span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
