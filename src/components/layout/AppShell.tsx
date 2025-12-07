import { useState, useCallback } from "react";
import Header from "./Header";
import ResizeHandle from "./ResizeHandle";
import AssistantPanel from "../assistant/AssistantPanel";
import EditorPanel from "../editor/EditorPanel";
import PreviewPanel from "../preview/PreviewPanel";
import CommandBar from "../command/CommandBar";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  code?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

const AppShell = () => {
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(400);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const minLeftWidth = 280;
  const maxLeftWidth = 400;
  const minRightWidth = 300;
  const maxRightWidth = 500;

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth(prev => Math.min(maxLeftWidth, Math.max(minLeftWidth, prev + delta)));
  }, []);

  const handleRightResize = useCallback((delta: number) => {
    setRightWidth(prev => Math.min(maxRightWidth, Math.max(minRightWidth, prev - delta)));
  }, []);

  const handleSubmit = useCallback((message: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "I've analyzed your request and prepared a response. Here's what I can help you with:",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        code: `#set text(size: 12pt)

= ${message.includes("heading") ? "New Heading" : "Document Section"}

This is the content you requested.`,
        actions: [
          { label: "Apply to Document", onClick: () => console.log("Applied") },
          { label: "Modify", onClick: () => console.log("Modify") },
          { label: "Explain Code", onClick: () => console.log("Explain") },
        ],
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1500);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - AI Assistant */}
        <div
          className="flex-shrink-0 border-r border-border overflow-hidden"
          style={{ width: leftWidth }}
        >
          <AssistantPanel messages={messages} isTyping={isTyping} />
        </div>

        <ResizeHandle onResize={handleLeftResize} />

        {/* Center Panel - Editor */}
        <div className="flex-1 min-w-0 overflow-hidden border-r border-border">
          <EditorPanel />
        </div>

        <ResizeHandle onResize={handleRightResize} />

        {/* Right Panel - Preview */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{ width: rightWidth }}
        >
          <PreviewPanel />
        </div>
      </div>

      {/* Command Bar */}
      <CommandBar onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
};

export default AppShell;
