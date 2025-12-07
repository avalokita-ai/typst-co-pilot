import { cn } from "@/lib/utils";

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

const ResizeHandle = ({ onResize, className }: ResizeHandleProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      onResize(delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div
      className={cn(
        "resize-handle group flex items-center justify-center",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="w-0.5 h-8 rounded-full bg-border group-hover:bg-primary transition-colors" />
    </div>
  );
};

export default ResizeHandle;
