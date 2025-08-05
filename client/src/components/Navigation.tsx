import { Link, useLocation } from "wouter";
import { Sunrise, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-card zen-soft-shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 zen-transition">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Sunrise className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">My Daily Office</h1>
          </Link>
          
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard">
              <a className={`${
                isActive("/dashboard") 
                  ? "text-accent font-medium" 
                  : "text-foreground hover:text-accent"
              } zen-transition font-medium`}>
                Dashboard
              </a>
            </Link>
            <Link href="/">
              <a className={`${
                isActive("/") && location === "/"
                  ? "text-accent font-medium" 
                  : "text-foreground hover:text-accent"
              } zen-transition font-medium`}>
                Today
              </a>
            </Link>
            <Link href="/community">
              <a className={`${
                isActive("/community") 
                  ? "text-accent font-medium" 
                  : "text-foreground hover:text-accent"
              } zen-transition font-medium`}>
                Community
              </a>
            </Link>
            <Link href="/calendar">
              <a className={`${
                isActive("/calendar") 
                  ? "text-accent font-medium" 
                  : "text-foreground hover:text-accent"
              } zen-transition font-medium`}>
                Calendar
              </a>
            </Link>
          </div>
          
          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-foreground" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.firstName || user?.email || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
