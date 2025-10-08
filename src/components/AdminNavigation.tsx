// src/components/AdminNavigation.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LogOut, LayoutDashboard, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUnreadCount();
      // Poll every 10 seconds for more responsive updates
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Refresh when navigating away from messages page
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

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-primary">Remrose Admin</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              to="/admin" 
              className={`flex items-center gap-2 text-sm font-medium transition-smooth ${
                isActive('/admin') ? 'text-accent' : 'text-muted-foreground hover:text-accent'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            
            <Link 
              to="/admin/messages" 
              className={`flex items-center gap-2 text-sm font-medium transition-smooth relative ${
                isActive('/admin/messages') ? 'text-accent' : 'text-muted-foreground hover:text-accent'
              }`}
            >
              <Inbox className="h-5 w-5" />
              Messages
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-5 flex items-center justify-center p-1 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;