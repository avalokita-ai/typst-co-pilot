import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
}

const VoiceButton = ({ isListening, onClick }: VoiceButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
        isListening
          ? "bg-primary text-primary-foreground animate-listening"
          : "bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground"
      )}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};

export default VoiceButton;
