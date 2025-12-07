import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language = "typst" }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-3 rounded-lg border border-border overflow-hidden bg-surface-editor">
      <div className="flex items-center justify-between px-3 py-1.5 bg-accent/50 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre className="p-3 text-sm font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface MessageBubbleProps {
  role: "assistant" | "user";
  content: string;
  timestamp?: string;
  code?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

const MessageBubble = ({ role, content, timestamp, code, actions }: MessageBubbleProps) => {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "animate-message-in",
        isAssistant ? "pr-8" : "pl-8"
      )}
    >
      <div
        className={cn(
          "rounded-xl p-4",
          isAssistant
            ? "bg-card border border-border"
            : "bg-primary/10 border border-primary/20"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isAssistant ? (
              <>
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">AI</span>
                </div>
                <span className="text-sm font-medium">Claude</span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-bold">U</span>
                </div>
                <span className="text-sm font-medium">You</span>
              </>
            )}
          </div>
          {timestamp && (
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>

        {/* Content */}
        <div className="text-sm leading-relaxed font-chat text-foreground/90">
          {content}
        </div>

        {/* Code Block */}
        {code && <CodeBlock code={code} />}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent hover:bg-accent/80 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
