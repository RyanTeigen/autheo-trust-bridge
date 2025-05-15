
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";
import { Link } from "react-router-dom";
import AutheoLogo from "@/components/ui/AutheoLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <AutheoLogo className="h-16 w-16 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-autheo-primary">404</h1>
        <p className="text-xl text-foreground mb-6">The page you're looking for doesn't exist</p>
        <FileSearch className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <p className="text-muted-foreground mb-8">
          The resource at <span className="font-mono bg-muted px-1 py-0.5 rounded">{location.pathname}</span> could not be found.
        </p>
        <Button asChild size="lg">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
