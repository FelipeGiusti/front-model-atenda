import { User } from "lucide-react";
import { Link, useLocation } from "wouter";
import DarkModeToggle from "@/components/dark-mode-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/agenda", label: "Agenda", icon: "calendar_today" },
    { href: "/patients", label: "Pacientes", icon: "people" },
    { href: "/medical-record", label: "Prontuário", icon: "description" },
    { href: "/reminders", label: "Lembretes", icon: "notifications" },
  ];

  // For mobile view, add the overlay and close functionality
  const sidebarClasses = cn(
    "w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200",
    isMobileOpen ? "fixed inset-0 z-50" : "hidden md:flex"
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <aside className={sidebarClasses}>
        {/* Mobile top nav */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h1 className="font-heading text-xl font-bold text-primary-600 dark:text-primary-400">Atenda+</h1>
          <button 
            onClick={onMobileClose}
            className="text-gray-500 dark:text-gray-400 focus:outline-none"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        {/* Sidebar header - desktop */}
        <div className="hidden md:flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-heading text-xl font-bold text-primary-600 dark:text-primary-400">Atenda+</h1>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <User size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.profession || 'Profissional da Saúde'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar">
          <ul className="py-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "sidebar-link",
                      location === item.href && "active"
                    )}
                  >
                    <span className="material-icons-round text-lg mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <DarkModeToggle />
          
          <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            A saúde do seu consultório também importa.
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
