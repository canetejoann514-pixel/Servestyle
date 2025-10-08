import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, User, LogOut, ShoppingCart, MessageCircle, Package } from "lucide-react"; 
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog"; 
import { useCart } from "@/hooks/useCart";
import CartCheckout from "./CartCheckout";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cartCount, clearCart } = useCart();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'admin' && location.pathname !== '/messages') {
      fetchUnreadCount();
    }
  }, [location.pathname, user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/messages/unread/${user.id}`);
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      clearCart();
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const handleCartClick = () => {
    if (!user) {
      toast.error('Please sign in to view your cart.');
      navigate('/auth');
      return false;
    }
    return true;
  };

  const handleMessagesClick = () => {
    if (!user) {
      toast.error('Please sign in to access messages.');
      navigate('/auth');
    } else {
      navigate('/messages');
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    { name: "Equipment", path: "/equipment" },
    { name: "Virtual Tours", path: "/tours" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-primary">Remrose</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-smooth ${
                  isActive(link.path)
                    ? "text-accent"
                    : "text-foreground hover:text-accent"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side (Messages, Cart, Profile, etc.) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Messages */}
            <Button 
              variant="ghost" 
              className="relative p-2 h-9 w-9"
              onClick={handleMessagesClick}
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Cart */}
            {user ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="relative p-2 h-9 w-9">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <CartCheckout />
              </Dialog>
            ) : (
              <Button 
                variant="ghost" 
                className="relative p-2 h-9 w-9"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}

            {/* User / Admin Actions */}
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/equipment">
                  <Button variant="hero" size="sm">
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {/* Messages + Cart (same as above) */}
            <Button 
              variant="ghost" 
              className="relative p-2 h-9 w-9"
              onClick={handleMessagesClick}
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="relative p-2 h-9 w-9">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <CartCheckout />
              </Dialog>
            ) : (
              <Button 
                variant="ghost" 
                className="relative p-2 h-9 w-9"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}

            {/* Hamburger */}
            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium transition-smooth ${
                    isActive(link.path)
                      ? "text-accent"
                      : "text-foreground hover:text-accent"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile User Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link to="/messages" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Messages
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/equipment" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full">
                        Book Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;