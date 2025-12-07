import { Settings, User, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded-md hover:bg-accent transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display text-sm font-bold">T</span>
          </div>
          <h1 className="font-display text-lg tracking-tight">Typst Assistant</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
