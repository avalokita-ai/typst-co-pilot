import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import VoiceButton from "./VoiceButton";
import WaveformVisualizer from "./WaveformVisualizer";
import { cn } from "@/lib/utils";

interface CommandBarProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}

const CommandBar = ({ onSubmit, isProcessing }: CommandBarProps) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      onSubmit(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop speech recognition
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <div
        className={cn(
          "flex items-end gap-3 rounded-xl border transition-all duration-200 p-2",
          isFocused
            ? "border-primary/50 shadow-glow bg-card"
            : "border-border bg-card/50"
        )}
      >
        {/* Voice Button */}
        <VoiceButton isListening={isListening} onClick={toggleVoice} />

        {/* Input Area */}
        <div className="flex-1 flex items-center gap-2">
          {isListening && <WaveformVisualizer isActive={isListening} />}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isListening ? "Listening..." : "Type a command or press to speak..."}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-6 max-h-[120px] py-2 font-chat placeholder:text-muted-foreground"
            rows={1}
            disabled={isProcessing}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
            input.trim() && !isProcessing
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Hint */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px]">⌘</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px]">Enter</kbd>
          <span className="ml-1.5">to submit</span>
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px]">⌘</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px]">⇧</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px]">V</kbd>
          <span className="ml-1.5">voice</span>
        </span>
      </div>
    </div>
  );
};

export default CommandBar;
