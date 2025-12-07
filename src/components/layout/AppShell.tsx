import { useState, useCallback } from "react";
import Header from "./Header";
import ResizeHandle from "./ResizeHandle";
import AssistantPanel from "../assistant/AssistantPanel";
import EditorPanel from "../editor/EditorPanel";
import PreviewPanel from "../preview/PreviewPanel";
import CommandBar from "../command/CommandBar";
import { useDocuments } from "@/hooks/useDocuments";
import { templates, TemplateKey } from "@/lib/templates";
import { toast } from "@/hooks/use-toast";

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
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  const {
    tabs,
    activeContent,
    setActiveTab,
    closeTab,
    createTab,
    updateContent,
  } = useDocuments();

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

  const handleTemplateSelect = useCallback((templateKey: TemplateKey) => {
    const template = templates[templateKey];
    createTab(template.name, template.content);
    
    // Add AI message about the template
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: `I've created a new ${templateKey} document for you! The "${template.name}" file is now open in the editor with a professional template structure. Feel free to customize it or ask me to make specific changes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, aiMessage]);
    
    toast({
      title: "Template Created",
      description: `New ${templateKey} document "${template.name}" is ready.`,
    });
  }, [createTab]);

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
      
      // Check for template requests
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("report")) {
        handleTemplateSelect("report");
        setIsProcessing(false);
        return;
      }
      if (lowerMessage.includes("slide") || lowerMessage.includes("presentation")) {
        handleTemplateSelect("slides");
        setIsProcessing(false);
        return;
      }
      if (lowerMessage.includes("article") || lowerMessage.includes("paper")) {
        handleTemplateSelect("article");
        setIsProcessing(false);
        return;
      }
      if (lowerMessage.includes("letter")) {
        handleTemplateSelect("letter");
        setIsProcessing(false);
        return;
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "I've analyzed your request and prepared a response. Here's what I can help you with:",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        code: `#set text(size: 12pt)

= ${message.includes("heading") ? "New Heading" : "Document Section"}

This is the content you requested.`,
        actions: [
          { label: "Apply to Document", onClick: () => {
            const currentContent = activeContent;
            const newContent = currentContent + `\n\n= ${message.includes("heading") ? "New Heading" : "Document Section"}\n\nThis is the content you requested.`;
            updateContent(newContent);
            toast({ title: "Applied", description: "Content added to your document." });
          }},
          { label: "Modify", onClick: () => console.log("Modify") },
          { label: "Explain Code", onClick: () => console.log("Explain") },
        ],
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1500);
  }, [handleTemplateSelect, activeContent, updateContent]);

  const togglePreviewFullscreen = useCallback(() => {
    setIsPreviewFullscreen(prev => !prev);
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
          <AssistantPanel 
            messages={messages} 
            isTyping={isTyping} 
            onTemplateSelect={handleTemplateSelect}
          />
        </div>

        <ResizeHandle onResize={handleLeftResize} />

        {/* Center Panel - Editor */}
        <div className="flex-1 min-w-0 overflow-hidden border-r border-border">
          <EditorPanel 
            tabs={tabs}
            activeContent={activeContent}
            onTabClick={setActiveTab}
            onTabClose={closeTab}
            onNewTab={() => createTab()}
            onContentChange={updateContent}
          />
        </div>

        <ResizeHandle onResize={handleRightResize} />

        {/* Right Panel - Preview */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{ width: isPreviewFullscreen ? '100%' : rightWidth }}
        >
          <PreviewPanel 
            code={activeContent}
            isFullscreen={isPreviewFullscreen}
            onToggleFullscreen={togglePreviewFullscreen}
          />
        </div>
      </div>

      {/* Command Bar */}
      {!isPreviewFullscreen && (
        <CommandBar onSubmit={handleSubmit} isProcessing={isProcessing} />
      )}

      {/* Fullscreen Preview Overlay */}
      {isPreviewFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <PreviewPanel 
            code={activeContent}
            isFullscreen={isPreviewFullscreen}
            onToggleFullscreen={togglePreviewFullscreen}
          />
        </div>
      )}
    </div>
  );
};

export default AppShell;
