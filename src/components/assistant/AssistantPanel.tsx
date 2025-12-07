import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { FileText, Presentation, BookOpen, Mail } from "lucide-react";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  code?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

interface AssistantPanelProps {
  messages: Message[];
  isTyping: boolean;
}

const quickActions = [
  { icon: FileText, label: "Report", description: "Professional report" },
  { icon: Presentation, label: "Slides", description: "Presentation deck" },
  { icon: BookOpen, label: "Article", description: "Academic paper" },
  { icon: Mail, label: "Letter", description: "Formal letter" },
];

const AssistantPanel = ({ messages, isTyping }: AssistantPanelProps) => {
  return (
    <div className="flex flex-col h-full panel-chat">
      {/* Panel Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          AI Assistant
        </h2>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="font-display text-lg mb-2">Welcome to Typst Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[240px] mx-auto">
                I can help you create beautiful documents. Try a quick template:
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all group"
                  >
                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                code={message.code}
                actions={message.actions}
              />
            ))
          )}
          
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AssistantPanel;
