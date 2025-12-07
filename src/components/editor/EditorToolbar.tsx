import { Bold, Italic, Underline, Heading1, Heading2, Heading3, List, ListOrdered, Image, Table, Calculator, Undo, Redo, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Tab {
  id: string;
  name: string;
  active: boolean;
}

interface EditorToolbarProps {
  tabs: Tab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

const EditorToolbar = ({ tabs, onTabClick, onTabClose, onNewTab }: EditorToolbarProps) => {
  return (
    <div className="border-b border-border">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-2 pt-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-sm cursor-pointer transition-colors ${
              tab.active
                ? "bg-surface-editor text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="text-xs">📄</span>
            <span className="font-mono text-xs">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={onNewTab}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-surface-editor">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Underline className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Heading1 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Image className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Table className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Calculator className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center justify-between px-3 py-1 bg-surface-editor border-t border-border text-xs text-muted-foreground font-mono">
        <span>document → heading → "Introduction"</span>
        <span>Ln 1 Col 1</span>
      </div>
    </div>
  );
};

export default EditorToolbar;
