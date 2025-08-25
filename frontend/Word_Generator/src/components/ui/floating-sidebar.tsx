import { useState } from "react";
import { 
  Home, 
  History, 
  Settings, 
  User, 
  LogOut, 
  ChevronRight,
  Brain,
  Sparkles,
  Calendar,
  BarChart3,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FloatingSidebarProps {
  currentPath?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  color: string;
}

export function FloatingSidebar({ currentPath = "/dashboard" }: FloatingSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", path: "/dashboard", color: "from-blue-500 to-cyan-500" },
    { icon: History, label: "History", path: "/history", color: "from-purple-500 to-pink-500" },
    { icon: Settings, label: "Settings", path: "/settings", color: "from-gray-500 to-slate-500" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  };

  const handleNavigation = (path: string) => {
    if (path === "/settings") {
      toast({
        title: "Coming Soon",
        description: `${path.slice(1)} feature is under development`,
      });
    } else {
      navigate(path);
    }
  };

  return (
    <>
      {/* Backdrop blur when expanded */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40 transition-all duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Floating Sidebar */}
      <div
        className={cn(
          "fixed left-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-700 ease-in-out",
          isCollapsed ? "translate-x-0" : "translate-x-0"
        )}
      >
        {/* Main Sidebar Container - Organic Shape */}
        <div
          className={cn(
            "relative bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl transition-all duration-700 ease-in-out overflow-hidden",
            isCollapsed 
              ? "w-16 h-16 rounded-2xl" 
              : "w-64 h-[500px] rounded-3xl"
          )}
          style={{
            background: isCollapsed 
              ? "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)"
          }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute z-10 bg-white/90 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 group",
              isCollapsed 
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl" 
                : "top-6 right-6 w-10 h-10 rounded-full hover:scale-110"
            )}
          >
            <ChevronRight 
              className={cn(
                "w-5 h-5 transition-transform duration-300 mx-auto",
                isCollapsed ? "rotate-0 text-blue-600" : "rotate-180 text-gray-600 group-hover:text-blue-600"
              )} 
            />
          </button>

          {/* Sidebar Content */}
          <div className={cn(
            "relative z-5 p-6 h-full flex flex-col transition-opacity duration-300",
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>

            {/* Header */}
            <div className="mb-8 pt-4">
              <div className="flex items-center space-x-3 mb-2">
                {/* Removed Sparkles icon */}
                <div>
                  <h2 className="text-lg font-bold text-gray-800">WordGen</h2>
                  <p className="text-xs text-gray-600">Professional</p>
                </div>
              </div>

              {/* User Profile */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3 border border-white/40">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">Welcome back!</p>
                    <p className="text-xs text-gray-600">Professional User</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                      isActive 
                        ? "bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg transform scale-105" 
                        : "hover:bg-white/30 hover:backdrop-blur-sm hover:border hover:border-white/40 hover:shadow-md hover:scale-102"
                    )}
                  >
                    {/* Animated background for active/hover */}
                    {(isActive || hoveredItem === item.path) && (
                      <div 
                        className={cn(
                          "absolute inset-0 bg-gradient-to-r opacity-10 transition-opacity duration-300",
                          item.color
                        )}
                      />
                    )}

                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10",
                      isActive 
                        ? `bg-gradient-to-r ${item.color} shadow-lg` 
                        : "bg-white/40 group-hover:bg-white/60"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        isActive ? "text-white" : "text-gray-700"
                      )} />
                    </div>

                    <div className="flex-1 text-left relative z-10">
                      <p className={cn(
                        "font-medium transition-colors duration-300",
                        isActive ? "text-gray-800" : "text-gray-700 group-hover:text-gray-800"
                      )}>
                        {item.label}
                      </p>
                      {item.badge && (
                        <span className="text-xs bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Hover indicator */}
                    {hoveredItem === item.path && (
                      <div className="w-1 h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent rounded-full absolute right-2 transition-all duration-300" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 hover:bg-red-500/10 hover:backdrop-blur-sm group"
              >
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors duration-300">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors duration-300">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating indicator dots */}
        <div className={cn(
          "absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
