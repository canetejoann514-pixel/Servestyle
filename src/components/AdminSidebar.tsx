// src/components/AdminSidebar.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, LayoutDashboard, Inbox, Package, Layers, Users, ChevronLeft, ChevronRight, Calendar, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AdminSidebar = ({ isCollapsed, setIsCollapsed, activeTab, onTabChange }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUnreadCount();
      fetchPendingPayments();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchPendingPayments();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && location.pathname !== '/admin/messages') {
      fetchUnreadCount();
    }
  }, [location.pathname, user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/conversations`);
      const data = await res.json();
      const total = data.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0);
      setUnreadCount(total);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`);
      const data = await res.json();
      const pending = data.filter(
        (booking: any) => 
          booking.paymentMethod === 'gcash' && 
          booking.paymentStatus === 'pending_verification'
      );
      setPendingPayments(pending.length);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isTabActive = (tab: string) => activeTab === tab;

  const navigationItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', tab: 'bookings' },
    { path: '/admin/messages', icon: Inbox, label: 'Messages', badge: unreadCount },
  ];

  const tabItems = location.pathname === '/admin' ? [
    { tab: 'bookings', icon: LayoutDashboard, label: 'Bookings' },
    { tab: 'payments', icon: CreditCard, label: 'Payment Verification', badge: pendingPayments },
    { tab: 'calendar', icon: Calendar, label: 'Calendar' },
    { tab: 'equipment', icon: Package, label: 'Equipment' },
    { tab: 'packages', icon: Layers, label: 'Packages' },
    { tab: 'users', icon: Users, label: 'Users' },
  ] : [];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 flex flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link
            to="/admin"
            className={`flex items-center gap-2 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
          >
            <Sparkles className="h-6 w-6 text-accent flex-shrink-0" />
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              Remrose Admin
            </span>
          </Link>
          {isCollapsed && (
            <Sparkles className="h-6 w-6 text-accent mx-auto" />
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-accent-foreground' : ''}`} />
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className={`h-5 min-w-5 flex items-center justify-center text-xs transition-all duration-300 ${
                        isCollapsed ? 'absolute -right-1 -top-1' : 'ml-auto'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Tab Items (only show on dashboard) */}
          {tabItems.length > 0 && (
            <>
              <div className={`pt-4 pb-2 ${isCollapsed ? 'hidden' : ''}`}>
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Management
                </p>
              </div>
              <div className="space-y-1">
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  const active = isTabActive(item.tab);
                  
                  return (
                    <button
                      key={item.tab}
                      onClick={() => onTabChange?.(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                        active
                          ? 'bg-accent/10 text-accent border-l-4 border-accent pl-2'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={`font-medium whitespace-nowrap transition-all duration-300 ${
                          isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && item.badge > 0 && (
                        <Badge
                          variant="destructive"
                          className={`h-5 min-w-5 flex items-center justify-center text-xs transition-all duration-300 ${
                            isCollapsed ? 'absolute -right-1 -top-1' : 'ml-auto'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={`w-full justify-start ${isCollapsed ? 'px-0 justify-center' : ''}`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span
              className={`ml-2 transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              }`}
            >
              Sign Out
            </span>
          </Button>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default AdminSidebar;