const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary-foreground">AI</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "0s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "0.2s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
