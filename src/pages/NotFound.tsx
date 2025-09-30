import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="hero" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
